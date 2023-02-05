<template>
  <div class="app-container">
    <el-page-header :content="breadCrumbContent" @back="back" />
    <el-card>
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="160px"
      >
        <el-form-item v-if="form.templateId" label="录制模板Id:" prop="templateId">
          <el-input v-model="form.templateId" class="fixed-width" disabled />
        </el-form-item>
        <el-form-item label="录制模板名称:" prop="templateName" class="form-with-tip">
          <el-input v-model="form.templateName" class="fixed-width" :disabled="!createOrUpdateFlag" />
          <div class="form-tip">4-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。模板名称不能重复。</div>
        </el-form-item>
        <el-form-item label="录制类别:" required prop="recordType">
          <el-radio-group v-model="form.recordType">
            <el-radio :label="1">全天录制</el-radio>
            <el-radio :label="2">按需录制</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="录制文件类型:" class="record-form-item">
          <el-input v-if="form.recordType === 1" v-model="form.storageTime" />天
          <el-table v-if="form.recordType === 2" ref="formatTable" :data="form.formatList" border size="mini" :header-cell-style="setHeaderClass" style="width: 80%; min-width: 650px;" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" :selectable="defaultSelectable" />
            <el-table-column prop="formatType" label="文件类型" align="center" width="100" />
            <el-table-column label="录制周期时长" align="center" width="250">
              <template slot-scope="{row}">
                <el-input v-model="row.interval" placeholder="5~120之间的整数" class="transcribe-cycle" size="mini" style="width: 90%;">
                  <template slot="append">分钟</template>
                </el-input>
              </template>
            </el-table-column>
            <el-table-column label="存储时长" align="center" width="300">
              <template slot-scope="{row}">
                <el-select v-model="row.storageTime" size="mini" style="width: 80%;">
                  <el-option v-for="item in storageTimeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="存储路径" align="center" min-width="400">
              <template slot-scope="{row}">
                <el-input v-model="row.path" :placeholder="placeHolder[userType]" size="mini" disabled />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="模板备注" prop="description">
          <el-input v-model="form.description" class="fixed-width" type="textarea" />
        </el-form-item>
        <el-form-item label="">
          <el-button :loading="loading" type="primary" @click="submit">{{ createOrUpdateFlag ? '新建' : '确定' }}</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { RecordTemplate } from '@/type/Template'
import { UserModule } from '@/store/modules/user'
import { RecordStorageType } from '@/dics'
import { queryRecordTemplate, createRecordTemplate, updateRecordTemplate } from '@/api/template'

@Component({
  name: 'create-or-update-record-template'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private createOrUpdateFlag = false
  private loading = false
  private rules = {
    templateName: [
      { required: true, message: '请输入录制模板名称', trigger: 'blur' },
      { validator: this.validateTemplateName, trigger: 'blur' }
    ]
  }
  private storageTimeList = [
    {
      label: '3天',
      value: 3 * 24 * 60
    },
    {
      label: '7天',
      value: 7 * 24 * 60
    },
    {
      label: '15天',
      value: 15 * 24 * 60
    },
    {
      label: '30天',
      value: 30 * 24 * 60
    },
    {
      label: '60天',
      value: 60 * 24 * 60
    },
    {
      label: '90天',
      value: 90 * 24 * 60
    },
    {
      label: '永久',
      value: 0
    }
  ]
  private storageTypeList = Object.values(RecordStorageType)
  private intervalReg = /^[1-9][0-9]*$/
  private timeReg = /^(([1-9][0-9]*)|[0-9])$/
  private selectedRows: any[] = []
  private form: RecordTemplate = {
    templateName: '',
    recordType: 1,
    description: '',
    formatList: [],
    storageTime: 30 // 最小 30 天
  }
  // HARDCODE: 针对天翼看家单独判断
  private placeHolder = {
    default: 'Prefix/{DeviceId}/{StartTime}/{StartTime}_{EndTime}',
    kanjia: 'Prefix/{DeviceId}_{StartTime}_{StreamType}_{StreamCode}'
  }
  private setHeaderClass() {
    return 'background: white'
  }

  private defaultSelectable(row: any, index: any) {
    if (index === 1 || index === 2) {
      return false
    } else {
      return true
    }
  }

  get userType() {
    return UserModule.type
  }

  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    this.createOrUpdateFlag = this.$route.path !== '/template/record/update'
    let query: any = this.$route.query
    if (query.templateId) {
      this.$set(this.form, 'templateId', query.templateId)
      this.loading = true
      const res = await queryRecordTemplate({ templateId: query.templateId })
      const data = res
      const selectedRows: any[] = []
      const resFormParams: RecordTemplate = {
        templateName: data.templateName,
        recordType: data.recordType,
        description: data.description,
        formatList: [],
        storageTime: 30
      }

      if (data.hlsParam && data.hlsParam.enable) {
        resFormParams.formatList.push({
          formatType: 'HLS',
          interval: data.hlsParam.interval / 60,
          path: data.hlsParam.path,
          storageTime: data.hlsParam.storageTime / 60
        })
        selectedRows.push(resFormParams.formatList[resFormParams.formatList.length - 1])
      } else {
        resFormParams.formatList.push({
          formatType: 'HLS',
          interval: 30,
          path: '{DeviceId}/record/{StartTime}',
          storageTime: 30 * 24 * 60
        })
      }

      if (data.flvParam && data.flvParam.enable) {
        resFormParams.formatList.push({
          formatType: 'FLV',
          interval: data.flvParam.interval / 60,
          path: data.flvParam.path,
          storageTime: data.flvParam.storageTime / 60
        })
        selectedRows.push(resFormParams.formatList[resFormParams.formatList.length - 1])
      } else {
        resFormParams.formatList.push({
          formatType: 'FLV',
          interval: 30,
          path: '{DeviceId}/record/{StartTime}',
          storageTime: 30 * 24 * 60
        })
      }

      if (data.mpParam && data.mpParam.enable) {
        resFormParams.formatList.push({
          formatType: 'MP4',
          interval: data.mpParam.interval / 60,
          path: data.mpParam.path,
          storageTime: data.mpParam.storageTime / 60
        })
        selectedRows.push(resFormParams.formatList[resFormParams.formatList.length - 1])
      } else {
        resFormParams.formatList.push({
          formatType: 'MP4',
          interval: 30,
          path: '{DeviceId}/record/{StartTime}',
          storageTime: 30 * 24 * 60
        })
      }

      this.form = {
        ...this.form,
        ...resFormParams
      }
      this.$nextTick(() => {
        selectedRows.forEach(row => {
          (this.$refs['formatTable'] as any).toggleRowSelection(row, true)
        })
      })
      this.loading = false
    } else {
      this.form.formatList.push({
        formatType: 'HLS',
        interval: 30,
        path: '{DeviceId}/record/{StartTime}',
        storageTime: 30 * 24 * 60
      }, {
        formatType: 'FLV',
        interval: 30,
        path: '{DeviceId}/record/{StartTime}',
        storageTime: 30 * 24 * 60
      }, {
        formatType: 'MP4',
        interval: 30,
        path: '{DeviceId}/record/{StartTime}',
        storageTime: 30 * 24 * 60
      })
      this.$nextTick(() => {
        (this.$refs['formatTable'] as any).toggleRowSelection(this.form.formatList[0], true)
      })
    }
  }

  private validateTemplateName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_\s]{4,64}$/u.test(value)) {
      callback(new Error('录制模板名称格式错误'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }

  private back() {
    this.$router.push('/template/record')
  }

  private handleSelectionChange(selection: any) {
    this.selectedRows = selection
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        if (!this.selectedRows || !this.selectedRows.length) {
          this.$message.error('请至少勾选一种录制类型')
          return
        }
        const validateResult = this.selectedRows.every(row => {
          if (!this.intervalReg.test(row.interval)) {
            this.$message.error('录制周期时长必须是5~120之间的整数')
            return false
          } else if (row.interval < 5 || row.interval > 120) {
            this.$message.error('录制周期时长必须是5~120之间的整数')
            return false
          }
          if (!this.timeReg.test(row.storageTime)) {
            this.$message.error('存储时长必须是大于等于0的整数')
            return false
          }
          return true
        })
        if (validateResult) {
          this.loading = true
          const param: any = {
            templateId: this.form.templateId || undefined,
            templateName: this.form.templateName,
            recordType: this.form.recordType,
            description: this.form.description,
            storageTime: this.form.storageTime
          }
          this.selectedRows.forEach(row => {
            if (row.formatType === 'HLS') {
              param.hlsParam = {
                enable: 1,
                interval: row.interval * 60,
                storageTime: row.storageTime * 60,
                path: row.path
              }
            } else if (row.formatType === 'FLV') {
              param.flvParam = {
                enable: 1,
                interval: row.interval * 60,
                storageTime: row.storageTime * 60,
                path: row.path
              }
            } else if (row.formatType === 'MP4') {
              param.mpParam = {
                enable: 1,
                interval: row.interval * 60,
                storageTime: row.storageTime * 60,
                path: row.path
              }
            }
          })
          param.hlsParam = param.hlsParam || { enable: 0 }
          param.flvParam = param.flvParam || { enable: 0 }
          param.mpParam = param.mpParam || { enable: 0 }
          try {
            if (this.form.templateId) {
              await updateRecordTemplate(param)
            } else {
              await createRecordTemplate(param)
            }
            this.loading = false
            this.$message.success(this.form.templateId ? '录制模板编辑成功' : '录制模板创建成功')
            this.back()
          } catch (e) {
            this.loading = false
            this.$message.error(e && e.message)
          }
        }
      } else {
        console.log('校验不通过')
      }
    })
  }
}
</script>

<style lang="scss" scoped>
  .fixed-width.el-input,
  .fixed-width.el-select,
  .fixed-width.el-textarea {
    width: 600px;
  }

  .record-form-item ::v-deep .el-form-item__content {
    overflow-x: auto;
  }
</style>
