<template>
  <el-dialog
    :visible="true"
    :title="data.headline"
    width="750px"
    center
    :destroy-on-close="true"
    @close="closeDialog"
  >
    <el-form label-width="10px" size="mini">
      <el-form-item>
        <span>{{ 'AccessKeyId: ' + data.accessKey }}</span>
        <el-button v-clipboard:copy="data.accessKey" v-clipboard:success="copySuccess" v-clipboard:error="copyError" type="text" class="ml10">
          <svg-icon name="copy" />
        </el-button>
      </el-form-item>
      <el-form-item>
        <span>{{ 'SecretAccessKey: ' + data.secretKey }}</span>
        <el-button v-clipboard:copy="data.secretKey" v-clipboard:success="copySuccess" v-clipboard:error="copyError" type="text" class="ml10">
          <svg-icon name="copy" />
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-alert
          type="error"
          :closable="false"
          title="SecretAccessKey仅在本次弹窗显示一次，关闭后将无法找回。密钥信息是您的重要资产，请妥善保存。"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="downloading" @click="downloadSecret">下载密钥</el-button>
      <el-button @click="closeDialog">关闭</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { exportSecret } from '@/api/secret'
import ExcelMixin from '@/views/device/mixin/excelMixin'

@Component({
  name: 'TipDialog'
})
export default class extends Mixins(ExcelMixin) {
  @Prop({ default: () => {} })
  private data!: any

  private downloading = false

  private closeDialog() {
    this.$emit('on-close')
  }

  private async downloadSecret() {
    try {
      this.downloading = true
      const res = await exportSecret({ ids: [this.data.id] })
      this.downloadFileUrl(`${this.data.type === 'api' ? 'API密钥' : 'OpenAPI授权'}`, res.exportFile)
    } catch (e) {
      this.$message.error(e.message)
    } finally {
      this.downloading = false
    }
  }

  private copySuccess() {
    this.$message({
      message: '密钥拷贝成功',
      type: 'success'
    })
  }

  private copyError() {
    this.$message({
      message: '密钥拷贝失败',
      type: 'error'
    })
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  max-height: 540px;
  overflow: auto;

  .el-form {
    .el-form-item {
      margin-bottom: 2px;
    }
  }
}

::v-deep .el-dialog__footer {
  margin-top: 0 !important;
}
</style>
