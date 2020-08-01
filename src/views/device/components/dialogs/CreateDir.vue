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
      label-position="right"
      label-width="100px"
    >
      <el-form-item label="目录名称:">
        <el-input v-model="form.dirName" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确 定</el-button>
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

  private async submit() {
    try {
      this.submitting = true
      this.isEdit ? await updateDir(this.form) : await createDir(this.form)
    } catch (e) {
      this.$message.error(e.response.data.message)
    } finally {
      this.submitting = false
    }
    this.closeDialog(true)
  }

  private closeDialog(isRefresh: boolean = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }
}
</script>
<style lang="scss" scoped>
</style>
