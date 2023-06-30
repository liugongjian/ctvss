<template>
  <el-dialog
    title="新建ISUP凭证"
    :append-to-body="true"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="700px"
    center
    class="dialog"
    @close="closeDialog"
  >
    <create-form ref="createForm" />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确 定</el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import CreateForm from './CreateForm.vue'

@Component({
  name: 'CreateGb28181CertificateDialog',
  components: {
    CreateForm
  }
})
export default class extends Vue {
  private dialogVisible = true
  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }

  private submit() {
    const form: any = this.$refs.createForm
    form.submit(() => {
      this.closeDialog(true)
    })
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  ::v-deep .el-dialog__body {
    padding-bottom: 0;
    padding-right: 50px;
  }
}
</style>
