<template>
  <el-dialog
    :title="isEdit ? '编辑目录' : '创建目录'"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    center
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="100px"
    >
      <el-form-item label="目录名称:" prop="dirName" class="form-with-tip">
        <el-input v-model="form.dirName" />
        <div class="form-tip">不超过64个字符，可包含大小写字母、数字、中文、中划线。</div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Dir } from '@/type/dir'
import { createDir, updateDir } from '@/api/dir'

@Component({
  name: 'CreateDir'
})
export default class extends Vue {
  @Prop()
  private currentDir?: any
  @Prop()
  private parentDir?: any
  @Prop()
  private groupId!: number
  private dialogVisible = true
  private submitting = false
  private form: Dir = {
    groupId: this.groupId,
    dirName: ''
  }
  private rules = {
    dirName: [
      { required: true, message: '请输入目录名称', trigger: 'blur' },
      { validator: this.validateDirName, trigger: 'blur' }
    ]
  }

  private get isEdit() {
    return !!this.currentDir
  }

  private mounted() {
    if (this.currentDir) {
      this.form.dirId = this.currentDir.id
      this.form.dirName = this.currentDir.label
    }
    if (this.parentDir) {
      this.form.parentDirId = this.parentDir.id
    } else {
      this.form.parentDirId = '0'
    }
  }

  private validateDirName(rule: any, value: string, callback: Function) {
    if (!/^[\u4e00-\u9fa50-9a-zA-Z-]{0,64}$/u.test(value)) {
      callback(new Error('目录名称格式错误'))
    } else {
      callback()
    }
  }

  private async submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          this.isEdit ? await updateDir(this.form) : await createDir(this.form)
          this.$message.success('创建目录成功！')
        } catch (e) {
          this.$message.error(e && e.message)
        } finally {
          this.submitting = false
        }
        this.closeDialog(true)
      }
    })
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
</style>
