<template>
  <div v-loading="submitting" class="app-container">
    <el-page-header :content="createOrUpdateFlag ? '新建视图存储模板' : '编辑视图存储模板'" @back="back" />
    <div class="body">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="160px"
      >
        <el-form-item label="视图存储模板名称:" prop="templateName" class="form-with-tip">
          <el-input v-model="form.templateName" :disabled="!createOrUpdateFlag" style="width: 463px;" placeholder="请输入模板名称" />
          <div v-if="createOrUpdateFlag" class="form-tip">4-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。模板名称不能重复。</div>
        </el-form-item>
        <el-form-item label="存储时长" prop="storageTime">
          <el-select v-model="form.storageTime" placeholder="请选择">
            <el-option
              v-for="time in timeRange"
              :key="time.value"            
              :label="time.label"            
              :value="time.value"            
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板备注" prop="description">
          <el-input v-model="form.description" style="width: 463px;" type="textarea" maxlength="255" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">{{ createOrUpdateFlag ? '新建' : '确定' }}</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator'
import { updateRecordTemplate, createRecordTemplate, createViidRecordTemplate, updateViidRecordTemplate } from '@/api/template'

@Component({
  name: 'create-or-update-record-template'
})
export default class extends Vue {
  @Prop()
  private createOrUpdateFlag: boolean // 新建/编辑
  @Prop()
  private formData?: any // 编辑时,模板数据
  @Prop()
  private templateId!: string

  private form: any = {}
  private submitting = false

  private timeRange = [
    {
      value: 30,
      label: '30天'
    },
    {
      value: 90,
      label: '90天'
    },
    {
      value: 180,
      label: '180天'
    },
    {
      value: 365,
      label: '365天'
    },
    {
      value: 1800,
      label: '1800天'
    }
  ]

  private rules = {
    templateName: [
      { required: true, message: '请输入录制模板名称', trigger: 'blur' },
      { validator: this.validateTemplateName, trigger: 'blur' }
    ],
    storageTime: [
      { required: true, message: '请选择存储时长', trigger: 'blur' },
    ] 
  }

  private mounted() {
    if (this.createOrUpdateFlag) {
    // 新建
      this.form = {
        templateId: this.templateId,
        templateName: '',
        description: '',
        recordType: 1,
        storageTime: 30
      }
    } else {
    // 编辑
      this.form = {
        templateId: this.templateId,
        templateName: this.formData.templateName,
        description: this.formData.description,
        recordType: this.formData.recordType,
        storageTime: this.formData.storageTime / 60 / 60 / 24 // 秒 --> 天
      }
    }
  }

  private async submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          // 提交时,不允许操作 模板列表
          this.$emit('on-submit', false)
          let templateId = this.templateId
          if (this.createOrUpdateFlag) {
            const params = {
              ...this.form,
              storageTime: this.form.storageTime * 24 * 60 * 60 // 秒 --> 天
            }
            const res = await createViidRecordTemplate(params)
            templateId = res.templateId
            this.$message.success('新建模板成功!')
          } else {
            const params = {
              templateId: templateId,
              ...this.form,
              storageTime: this.form.storageTime * 24 * 60 * 60 // 秒 --> 天
            }
            console.log(';?   ', params)
            await updateViidRecordTemplate(params)
            this.$message.success('修改模板成功!')
          }
          this.submitting = false
          this.closePage(true, templateId)
          this.$emit('on-submit', true)
        } catch (e) {
          this.submitting = false
          this.$emit('on-submit', true)
          // this.$message.error(e)
          this.$message.error(e.message)
        }
      }
    })
  }

  private closePage(isRefresh: boolean, templateId?) {
    this.$emit('on-close', {
      isRefresh, templateId
    })
    // 清空数据
    const form: any = this.$refs.dataForm
    form.resetFields()
  }

  private back() {
    this.closePage(false)
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
}
</script>
<style lang="scss" scoped>
</style>