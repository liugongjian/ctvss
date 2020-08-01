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
          <el-input v-model="form.templateId" disabled />
        </el-form-item>
        <el-form-item label="录制模板名称:" prop="templateName" class="form-with-tip">
          <el-input v-model="form.templateName" />
          <div class="form-tip">4-16位，可包含大小写字母、数字、中划线。模板名称不能重复。</div>
        </el-form-item>
        <el-form-item label="录制类别:" required prop="recordType" class="form-with-tip">
          <el-radio-group v-model="form.recordType">
            <el-radio :label="1">自动录制</el-radio>
            <el-radio :label="2">按需录制</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="录制周期时长：" prop="interval" class="form-with-tip">
          <el-input v-model="form.interval" placeholder="请输入录制周期时长" class="transcribe-cycle">
            <template slot="append">分钟</template>
          </el-input>
          <div class="form-tip">录制周期支持15-360分钟，视频时长超过设定的录制周期后，将生成新文件</div>
        </el-form-item>
        <el-form-item label="存储时长：" prop="storageTime" class="form-with-tip">
          <el-input v-model="form.storageTime" placeholder="请输入存储时长" class="transcribe-cycle">
            <template slot="append">分钟</template>
          </el-input>
          <div class="form-tip">录制文件存储时长，0代表永久存储</div>
        </el-form-item>
        <el-form-item label="存储格式:" prop="storeType">
          <el-checkbox-group v-model="form.storeType">
            <el-checkbox
              v-for="storageType in storageTypeList"
              :key="storageType"
              :label="storageType"
              :disabled="storageType !== 'hls'"
            >
              {{ storageType.toLocaleUpperCase() }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="form.storeType.length" label="存储规则:">
          <el-row v-if="mp4Show" class="mb10">
            <el-col :span="1">
              <span>MP4</span>
            </el-col>
            <el-col :span="23">
              <el-input v-model="form.mp4" placeholder="record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}" />
            </el-col>
          </el-row>
          <el-row v-if="flvShow" class="mb10">
            <el-col :span="1">
              <span>FLV</span>
            </el-col>
            <el-col :span="23">
              <el-input v-model="form.flv" placeholder="record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}" />
            </el-col>
          </el-row>
          <el-row v-if="hlsShow" class="mb10">
            <el-col :span="1">
              <span>M3U8</span>
            </el-col>
            <el-col :span="23">
              <el-input v-model="form.m3u8" placeholder="record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}" />
            </el-col>
          </el-row>
          <el-row v-if="hlsShow">
            <el-col :span="1">
              <span>TS</span>
            </el-col>
            <el-col :span="23">
              <el-input v-model="form.ts" placeholder="record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="模板备注" prop="description">
          <el-input v-model="form.description" type="textarea" />
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
import { RecordTemplate } from '@/type/template'
import { RecordStorageType } from '@/dics'
import { queryRecordTemplate, createRecordTemplate, updateRecordTemplate } from '@/api/template'
import { unwatchFile } from 'fs'

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
    ],
    interval: [
      { required: true, message: '请输入录制周期时长', trigger: 'blur' },
      { validator: this.validateInterval, trigger: 'blur' }
    ],
    storageTime: [
      { required: true, message: '请输入存储时长', trigger: 'blur' },
      { validator: this.validateStorageTime, trigger: 'blur' }
    ],
    storeType: [
      { required: true, message: '请至少勾选一种存储格式', trigger: 'blur' }
    ]
  }
  private storageTypeList = Object.values(RecordStorageType)
  private form: RecordTemplate = {
    templateName: '',
    recordType: 1,
    storageTime: 0,
    interval: 15,
    storeType: ['hls'],
    mp4: 'record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}',
    flv: 'record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}',
    m3u8: 'record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}',
    ts: 'record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}',
    description: ''
  }

  private get mp4Show() {
    return this.form.storeType.indexOf('mp4') !== -1
  }

  private get flvShow() {
    return this.form.storeType.indexOf('flv') !== -1
  }

  private get hlsShow() {
    return this.form.storeType.indexOf('hls') !== -1
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
      const resFormParams = {
        templateName: data.templateName,
        recordType: data.recordType,
        interval: data.hlsParam.interval / 60,
        storageTime: data.hlsParam.storageTime / 60,
        m3u8: data.hlsParam.muPath,
        ts: data.hlsParam.tsPath,
        description: data.description
      }
      this.form = {
        ...this.form,
        ...resFormParams
      }
      this.loading = false
    }
  }

  private validateTemplateName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{4,16}$/u.test(value)) {
      callback(new Error('录制模板名称格式错误'))
    } else {
      callback()
    }
  }

  private validateInterval(rule: any, value: string, callback: Function) {
    const numReg = /^[1-9][0-9]*$/
    if (!numReg.test(value) || Number(value) < 15 || Number(value) > 360) {
      callback(new Error('录制周期时长必须是15~360之间的整数'))
    } else {
      callback()
    }
  }

  private validateStorageTime(rule: any, value: string, callback: Function) {
    const numReg = /^(([1-9][0-9]*)|[0-9])$/
    if (!numReg.test(value) || Number(value) < 0) {
      callback(new Error('录制周期时长必须是大于等于0的整数'))
    } else {
      callback()
    }
  }

  private back() {
    this.$router.push('/template/record')
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        var res
        this.loading = true
        const param = {
          templateId: this.form.templateId || undefined,
          templateName: this.form.templateName,
          recordType: this.form.recordType,
          description: this.form.description,
          hlsParam: {
            enable: false,
            interval: this.form.interval * 60,
            storageTime: this.form.storageTime * 60,
            muPath: this.form.m3u8,
            tsPath: this.form.ts
          }
        }
        if (this.form.templateId) {
          res = await updateRecordTemplate(param)
        } else {
          res = await createRecordTemplate(param)
        }
        this.loading = false
        if (res.errorCode) {
          console.log('error create!!')
        } else {
          this.$message.success(this.form.templateId ? '录制模板编辑成功' : '录制模板创建成功')
          this.back()
        }
      } else {
        console.log('error submit!!')
      }
    })
  }
}
</script>

<style lang="scss" scoped>
  .el-input, .el-select, .el-textarea {
    width: 400px;
  }
</style>
