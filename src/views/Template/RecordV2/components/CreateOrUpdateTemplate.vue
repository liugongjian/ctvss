<template>
  <div v-loading="submitting" class="app-container">
    <div class="header">
      <span>
        <el-button type="text" style="color: #faad15;" @click="back">&lt; 返回</el-button>
      </span>
      <span style="font-size: 16px;font-weight: bold;">
        {{ createOrUpdateFlag ? '新建录制模板' : '编辑录制模板' }}
      </span>
    </div>
    <div class="body">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="160px"
      >
        <el-form-item label="录制模板名称:" prop="templateName" class="form-with-tip">
          <el-input v-model="form.templateName" :disabled="!createOrUpdateFlag" style="width: 463px;" placeholder="请输入模板名称" />
          <div v-if="createOrUpdateFlag" class="form-tip">4-64位，可包含大小写字母、数字、中文、中划线、下划线、小括号、空格。模板名称不能重复。</div>
        </el-form-item>
        <el-form-item label="录制类别:" prop="recordType">
          <el-radio-group v-model="form.recordType">
            <el-radio :label="1">自动录制</el-radio>
            <el-radio :label="2">按需录制</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="存储时长:" prop="storageTime" class="record-form-item">
          <el-input v-model="form.storageTime" type="number" min="0" oninput="value=value.replace(/[^\d]/g,'')" style="width: 150px;"><span slot="suffix">天</span></el-input>
        </el-form-item>
        <el-form-item label="模板备注" prop="description">
          <el-input v-model="form.description" style="width: 463px;" type="textarea" :autosize="{minRows: 2, maxRows: 4}" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="submit">{{ createOrUpdateFlag ? '新建' : '确定' }}</el-button>
          <el-button @click="back">取 消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { updateRecordTemplate, createRecordTemplate } from '@/api/template'

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

  private rules = {
    templateName: [
      { required: true, message: '请输入录制模板名称', trigger: 'blur' },
      { validator: this.validateTemplateName, trigger: 'blur' }
    ],
    storageTime: [
      { required: true, message: '请填写存储时长', trigger: 'blur' }
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
          if (this.createOrUpdateFlag) {
            const params = {
              ...this.form,
              storageTime: this.form.storageTime * 24 * 60 * 60 // 秒 --> 天
            }
            await createRecordTemplate(params)
            this.$message.success('新建模板成功!')
          } else {
            const params = {
              ...this.form,
              storageTime: this.form.storageTime * 24 * 60 * 60 // 秒 --> 天
            }
            await updateRecordTemplate(params)
            this.$message.success('修改模板成功!')
          }
          this.submitting = false
          this.closePage(true)
          this.$emit('on-submit', true)
        } catch (e) {
          this.submitting = false
          this.$emit('on-submit', true)
          this.$message.error(e)
        }
      }
    })
  }

  private closePage(isRefresh: boolean) {
    this.$emit('on-close', isRefresh)
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
