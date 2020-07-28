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
        <el-input v-model="form.dir" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="closeDialog">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Dir } from '@/type/dir'

@Component({
  name: 'CreateDir'
})
export default class extends Vue {
  @Prop()
  private currentDir?: Dir
  @Prop()
  private parentDir?: Dir
  @Prop()
  private groupId!: number
  private dialogVisible = true
  private form: Dir = {
    groupId: this.groupId,
    dirName: ''
  }

  private get isEdit() {
    return !!this.currentDir
  }

  private mounted() {
    if (this.currentDir) {
      this.form.dirId = this.currentDir.dirId
      this.form.dirName = this.currentDir.dirName
    }
    if (this.parentDir) {
      this.form.parentDirId = this.parentDir.dirId
    }
  }

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }
}
</script>
<style lang="scss" scoped>
</style>
