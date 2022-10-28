<template>
  <el-dialog
    title="设置回调模板"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="list"
      fit
      highlight-current-row
      max-height="500"
    >
      <el-table-column prop="templateName" label="模板名称" min-width="50" />
      <el-table-column label="回调URL">
        <template slot-scope="{ row }">
          <div v-if="row.recordNotifyUrl">录制回调: {{ row.recordNotifyUrl }}</div>
          <div v-if="row.deviceStatusUrl">设备状态回调: {{ row.deviceStatusUrl }}</div>
          <div v-if="row.streamStatusUrl">流状态回调: {{ row.streamStatusUrl }}</div>
          <div v-if="row.aiEventNotifyUrl">AI事件通知回调: {{ row.aiEventNotifyUrl }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="callbackKey" label="回调Key" />
      <el-table-column label="操作" width="100">
        <template slot-scope="{ row }">
          <el-button v-if="row.templateId !== bindTemplateId" type="text" :disabled="!!bindTemplateId" @click="bind(row)">绑定</el-button>
          <el-button v-else type="text" @click="unbind(row)">解绑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关闭</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getCallbackTemplates, setDeviceCallbackTemplate, unbindDeviceCallbackTemplate } from '@vss/device/api/template'
import { formatSeconds } from '@vss/base/utils/interval'

@Component({
  name: 'SetCallBackTemplate'
})
export default class extends Vue {
  @Prop() private deviceId?: string
  @Prop() private templateId?: string
  private dialogVisible = true
  private loading = false
  private list = []
  private formatSeconds = formatSeconds
  private bindTemplateId = ''

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }

  /**
   * 初始化
   */
  private async mounted() {
    this.bindTemplateId = this.templateId
    this.getCallbackTemplates()
  }

  /**
   * 获取回调模板列表
   */
  private async getCallbackTemplates() {
    try {
      this.loading = true
      const res = await getCallbackTemplates({
        pageNum: 1,
        pageSize: 999
      })
      this.list = res.templates
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 绑定回调模板
   */
  private async bind(row: any) {
    const params = {
      deviceId: this.deviceId,
      templateId: row.templateId
    }
    try {
      this.loading = true
      await setDeviceCallbackTemplate(params)
      this.bindTemplateId = row.templateId
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  /**
   * 解绑回调模板
   */
  private async unbind(row: any) {
    const params = {
      deviceId: this.deviceId,
      templateId: row.templateId
    }
    try {
      this.loading = true
      await unbindDeviceCallbackTemplate(params)
      this.bindTemplateId = ''
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }
}
</script>