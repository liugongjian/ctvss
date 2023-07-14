<template>
  <el-dialog
    :visible="true"
    :title="data.headline"
    width="750px"
    center
    :destroy-on-close="true"
    @close="closeDialog"
  >
    <template v-if="data.type === 'api'">
      <el-form v-if="step" label-width="10px" size="mini">
        <el-form-item>
          <el-alert
            type="error"
            :closable="false"
            title="请及时下载保存密钥信息，弹窗关闭后将无法再次获取该密钥信息。密钥信息是您的重要资产，请妥善保存。"
          />
        </el-form-item>
      </el-form>
      <el-form v-else label-width="80px" label-position="left">
        <el-form-item label="描述">
          <el-input v-model="description" type="textarea" rows="5" placeholder="请输入API密钥描述"></el-input>
        </el-form-item>
      </el-form>
      <div v-if="!step" slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="confirm">确定</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </div>
      <div v-else slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="downloadCSV">立即下载密钥</el-button>
        <!-- <el-button type="primary" :loading="loading" @click="downloadSecret">下载密钥</el-button> -->
        <el-button @click="closeDialog">关闭</el-button>
      </div>
    </template>
    <template v-else>
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
    </template>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { exportSecret, exportSecretCSV } from '@/api/secret'
import ExcelMixin from '@/views/device/mixin/excelMixin'

@Component({
  name: 'TipDialog'
})
export default class extends Mixins(ExcelMixin) {
  @Prop()
  private data!: any

  @Prop()
  private step!: number

  private loading = false
  private description = ''

  private mounted(){
    this.description = this.data.description
  }

  private closeDialog() {
    this.$emit('on-close')
  }

  private async downloadSecret() {
    try {
      this.loading = true
      const res = await exportSecret({ ids: [this.data.id] })
      this.downloadFileUrl(`${this.data.type === 'api' ? 'API密钥' : 'OpenAPI授权'}`, res.exportFile)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async downloadCSV(){
    this.loading = true
    try {
      const res = await exportSecretCSV({ ids: [this.data.id] })
      this.downloadFileUrl('API密钥', res.exportFile)
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async confirm(){
    this.$emit('edit-secret', { id: this.data.id, description: this.description })
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

      .el-textarea {
        width: 560px;
      }

      .el-form-item__label {
        text-align: right !important;
      }
    }
  }
}

::v-deep .el-dialog__footer {
  margin-top: 0 !important;
}
</style>