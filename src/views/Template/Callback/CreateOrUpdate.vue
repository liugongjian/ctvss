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
        <el-form-item v-if="form.templateId" label="回调模板Id:" prop="templateId">
          <el-input v-model="form.templateId" class="fixed-width" disabled />
        </el-form-item>
        <el-form-item label="回调模板名称:" prop="templateName" class="form-with-tip">
          <el-input v-model="form.templateName" class="fixed-width" :disabled="!createOrUpdateFlag" />
          <div class="form-tip">4-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。模板名称不能重复。</div>
        </el-form-item>
        <el-form-item label="录制回调:" prop="recordNotifyUrl" class="form-with-tip">
          <el-input v-model="form.recordNotifyUrl" class="fixed-width" />
          <div class="form-tip">录制回调URL，以http、https等开头</div>
        </el-form-item>
        <el-form-item label="设备状态回调:" prop="deviceStatusUrl" class="form-with-tip">
          <el-input v-model="form.deviceStatusUrl" class="fixed-width" />
          <div class="form-tip">设备状态回调URL，以http、https等开头</div>
        </el-form-item>
        <el-form-item label="流状态回调:" prop="streamStatusUrl" class="form-with-tip">
          <el-input v-model="form.streamStatusUrl" class="fixed-width" />
          <div class="form-tip">流状态回调URL，以http、https等开头</div>
        </el-form-item>
        <el-form-item label="AI事件通知回调:" prop="aiEventNotifyUrl" class="form-with-tip">
          <el-input v-model="form.aiEventNotifyUrl" class="fixed-width" />
          <div class="form-tip">AI事件通知回调URL，以http、https等开头</div>
        </el-form-item>
        <el-form-item label="回调KEY:" prop="callbackKey" class="form-with-tip">
          <el-input v-model="form.callbackKey" class="fixed-width" />
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
import { CallbackTemplate } from '@/type/Template'
import { queryCallbackTemplate, createCallbackTemplate, updateCallbackTemplate } from '@/api/template'

@Component({
  name: 'create-or-update-callback-template'
})
export default class extends Vue {
  private breadCrumbContent = ''
  private createOrUpdateFlag = false
  private loading = false
  private rules = {
    templateName: [
      { required: true, message: '请输入回调模板名称', trigger: 'blur' },
      { validator: this.validateTemplateName, trigger: 'blur' }
    ],
    recordNotifyUrl: [
      { validator: this.validateCallbackUrl, trigger: 'blur' }
    ],
    deviceStatusUrl: [
      { validator: this.validateDeviceStatusCallbackUrl, trigger: 'blur' }
    ],
    streamStatusUrl: [
      { validator: this.validateStreamStatusCallbackUrl, trigger: 'blur' }
    ],
    aiEventNotifyUrl: [
      { validator: this.validateAiEventNotifyCallbackUrl, trigger: 'blur' }
    ],
    callbackKey: [
      { required: true, message: '请输入回调KEY', trigger: 'blur' }
    ]
  }
  private urlReg = /^(((http:|https:)\/\/)[a-zA-Z0-9][a-zA-Z0-9-]{0,62}((:(\d*\*\d*|\d+))*|\.[a-zA-Z0-9][a-zA-Z0-9-]{0,62})+(:(\d*\*\d*|\d+))*(\/[a-zA-Z0-9-.]*)*)*$/
  private selectedRows: any[] = []
  private form: CallbackTemplate = {
    templateName: '',
    recordNotifyUrl: '',
    deviceStatusUrl: '',
    streamStatusUrl: '',
    aiEventNotifyUrl: '',
    callbackKey: '',
    description: ''
  }

  private async mounted() {
    this.breadCrumbContent = this.$route.meta.title
    this.createOrUpdateFlag = this.$route.path !== '/template/callback/update'
    let query: any = this.$route.query
    if (query.templateId) {
      this.$set(this.form, 'templateId', query.templateId)
      this.loading = true
      const res = await queryCallbackTemplate({ templateId: query.templateId })
      this.form = res
      this.loading = false
    } else {
      // do nothing
    }
  }

  private validateTemplateName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-()（）_\s]{4,64}$/u.test(value)) {
      callback(new Error('回调模板名称格式错误'))
    } else if (/^[\s]|[\s]$/.test(value)) {
      callback(new Error('不能以空格作为名称的首尾。'))
    } else {
      callback()
    }
  }

  private validateCallbackUrl(rule: any, value: string, callback: Function) {
    if (!this.urlReg.test(value)) {
      callback(new Error('录制回调地址格式不正确，请重新输入'))
    } else {
      callback()
    }
  }

  private validateDeviceStatusCallbackUrl(rule: any, value: string, callback: Function) {
    if (!this.urlReg.test(value)) {
      callback(new Error('设备状态回调地址格式不正确，请重新输入'))
    } else {
      callback()
    }
  }

  private validateStreamStatusCallbackUrl(rule: any, value: string, callback: Function) {
    if (!this.urlReg.test(value)) {
      callback(new Error('流状态回调地址格式不正确，请重新输入'))
    } else {
      callback()
    }
  }

  private validateAiEventNotifyCallbackUrl(rule: any, value: string, callback: Function) {
    if (!this.urlReg.test(value)) {
      callback(new Error('AI事件通知回调地址格式不正确，请重新输入'))
    } else {
      callback()
    }
  }

  private back() {
    this.$router.push('/template/callback')
  }

  private submit() {
    if (!this.form.recordNotifyUrl && !this.form.deviceStatusUrl && !this.form.streamStatusUrl && !this.form.aiEventNotifyUrl) {
      this.$message.error('请至少填写一个回调地址！')
      return
    }
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        this.loading = true
        const param: any = {
          templateId: this.form.templateId || undefined,
          templateName: this.form.templateName,
          recordNotifyUrl: this.form.recordNotifyUrl,
          deviceStatusUrl: this.form.deviceStatusUrl,
          streamStatusUrl: this.form.streamStatusUrl,
          aiEventNotifyUrl: this.form.aiEventNotifyUrl,
          callbackKey: this.form.callbackKey,
          description: this.form.description
        }
        try {
          if (this.form.templateId) {
            await updateCallbackTemplate(param)
          } else {
            await createCallbackTemplate(param)
          }
          this.loading = false
          this.$message.success(this.form.templateId ? '回调模板编辑成功' : '回调模板创建成功')
          this.back()
        } catch (e) {
          this.loading = false
          this.$message.error(e && e.message)
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
</style>
