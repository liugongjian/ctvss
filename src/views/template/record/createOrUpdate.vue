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
        <el-form-item label="服务区域:" prop="region" class="form-with-tip">
          <el-select v-model="form.region" placeholder="请选择">
            <el-option v-for="item in regionList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="录制周期时长：" prop="interval" required class="form-with-tip">
          <el-input v-model="form.interval" placeholder="请输入录制周期时长" class="transcribe-cycle">
            <template slot="append">分钟</template>
          </el-input>
          <div class="form-tip">录制周期支持15-360分钟，视频时长超过设定的录制周期后，将生成新文件</div>
        </el-form-item>
        <el-form-item label="存储格式:" prop="storeType">
          <el-checkbox-group v-model="form.storeType">
            <el-checkbox
              v-for="storageType in storageTypeList"
              :key="storageType"
              :label="storageType"
            >
              {{ storageType.toLocaleUpperCase() }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <!-- <el-form-item label="存储规则:">
          <el-row class="mb10">
            <el-col :span="1">
              <span>MP4</span>
            </el-col>
            <el-col :span="23">
              <el-input v-model="form.storeRules[0]" placeholder="record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}" />
            </el-col>
          </el-row>
          <el-row class="mb10">
            <el-col :span="1">
              <span>FLV</span>
            </el-col>
            <el-col :span="23">
              <el-input v-model="form.storeRules[1]" placeholder="record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}" />
            </el-col>
          </el-row>
          <el-row class="mb10">
            <el-col :span="1">
              <span>M3U8</span>
            </el-col>
            <el-col :span="23">
              <el-input v-model="form.storeRules[2]" placeholder="record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}" />
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="1">
              <span>TS</span>
            </el-col>
            <el-col :span="23">
              <el-input v-model="form.storeRules[3]" placeholder="record/{AppName}/{StreamName}/{EscapedStartTime}_{EscapedEndTime}" />
            </el-col>
          </el-row>
        </el-form-item> -->
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
    region: [
      { required: true, message: '请选择区域', trigger: 'change' }
    ],
    interval: [
      { required: true, message: '请输入录制周期时长', trigger: 'blur' },
      { validator: this.validateInterval, trigger: 'blur' }
    ],
    storeType: [
      { required: true, message: '请至少勾选一种存储格式', trigger: 'blur' }
    ]
  }
  private regionList = ['华东', '华南', '华北']
  private storageTypeList = Object.values(RecordStorageType)
  private form: RecordTemplate = {
    templateName: '',
    region: '华东',
    interval: 15,
    storeType: [],
    storeRules: ['', '', '', '']
  }

  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    this.createOrUpdateFlag = this.$route.path !== '/template/record/update'
    let query: any = this.$route.query
    if (query.templateId) {
      this.$set(this.form, 'templateId', query.templateId)
      this.loading = true
      const res = await queryRecordTemplate({ templateId: query.templateId })
      this.form = {
        ...this.form,
        ...res
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

  private back() {
    this.$router.push('/template/record')
  }

  private submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        var res
        this.loading = true
        if (this.form.templateId) {
          res = await updateRecordTemplate(this.form)
        } else {
          res = await createRecordTemplate(this.form)
        }
        this.loading = false
        if (res.errorCode) {
          console.log('error create!!')
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
