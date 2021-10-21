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
      <el-table-column prop="templateName" label="模板名称" />
      <el-table-column label="回调URL">
        <template slot-scope="{row}">
          <span v-if="row.recordNotifyUrl">录制回调: {{ row.recordNotifyUrl }}</span>
          <span v-if="row.deviceStatusUrl">设备状态回调: {{ row.deviceStatusUrl }}</span>
          <span v-if="row.streamStatusUrl">流状态回调: {{ row.streamStatusUrl }}</span>
          <span v-if="row.aiEventNotifyUrl">AI事件通知回调: {{ row.aiEventNotifyUrl }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="callbackKey" label="回调Key" />
      <el-table-column label="操作">
        <template slot-scope="{row}">
          <el-button v-if="row.templateId !== bindTemplateId" type="text" :disabled="bindTemplateId.length !== 0" @click="bind(row)">绑定</el-button>
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
import { setGroupCallBackTemplate, unbindGroupCallBackTemplate } from '@/api/group'
import { setDeviceCallbackTemplate, unbindDeviceCallbackTemplate } from '@/api/device'
import { getCallBackTemplates } from '@/api/stream'
import { formatSeconds } from '@/utils/interval'

@Component({
  name: 'SetCallBackTemplate'
})
export default class extends Vue {
  @Prop() private groupId?: string
  @Prop() private deviceId?: string
  @Prop() private templateId?: string
  @Prop() private inProtocol?: string
  private dialogVisible = true
  private loading = false
  private list = [
  ]
  private formatSeconds = formatSeconds
  private bindTemplateId = ''

  private closeDialog() {
    this.dialogVisible = false
    this.$emit('on-close')
  }

  private async bind(row: any) {
    let params = {
      groupId: this.groupId,
      deviceId: this.deviceId,
      templateId: row.templateId,
      inProtocol: this.inProtocol
    }
    try {
      this.loading = true
      if (this.groupId) {
        await setGroupCallBackTemplate(params)
      } else if (this.deviceId) {
        await setDeviceCallbackTemplate(params)
      }
      this.bindTemplateId = row.templateId
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async unbind(row: any) {
    let params = {
      groupId: this.groupId,
      deviceId: this.deviceId,
      templateId: row.templateId,
      inProtocol: this.inProtocol
    }
    try {
      this.loading = true
      if (this.groupId) {
        await unbindGroupCallBackTemplate(params)
      } else if (this.deviceId) {
        await unbindDeviceCallbackTemplate(params)
      }
      this.bindTemplateId = ''
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private async mounted() {
    this.bindTemplateId = this.templateId!
    try {
      this.loading = true
      const res = await getCallBackTemplates({
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
}
</script>
<style lang="scss" scoped>
</style>
