<template>
  <div>
    <div>
      <el-button type="text" class="template-edit" @click="setRecordTemplate">编辑</el-button>
      <info-list title="录制模板">
        <el-table v-loading="loading.record" :data="template.recordTemplate" empty-text="该设备或组没有绑定录制模板" fit>
          <el-table-column prop="templateName" label="模板名称" />
          <el-table-column prop="recordType" label="是否启用自动录制">
            <template slot-scope="{row}">
              {{ row.recordType === 1 ? '是':'否' }}
            </template>
          </el-table-column>
          <el-table-column prop="storeType" label="录制格式">
            <template slot-scope="{row}">
              {{ row.flvParam.enable ? 'flv': '' }}
              {{ row.hlsParam.enable ? 'hls': '' }}
              {{ row.mpParam.enable ? 'mp4': '' }}
            </template>
          </el-table-column>
        </el-table>
      </info-list>
    </div>
    <div style="margin-top:20px;">
      <el-button type="text" class="template-edit" @click="setCallbackTemplate">编辑</el-button>
      <info-list title="回调模板">
        <el-table v-loading="loading.callback" :data="template.callbackTemplate" fit empty-text="该设备或组没有绑定录制模板">
          <el-table-column prop="templateName" label="模板名称" />
          <el-table-column prop="recordNotifyUrl" label="回调URL" />
          <el-table-column prop="callbackKey" label="回调Key" />
        </el-table>
      </info-list>
    </div>
    <SetRecordTemplate
      v-if="setRecordTemplateDialog"
      :group-id="groupId"
      :device-id="deviceId"
      :stream-id="streamId"
      :template-id="recordTemplateId"
      @on-close="closeSetRecordTemplateDialog"
    />
    <SetCallBackTemplate
      v-if="setCallbackTemplateDialog"
      :stream-id="streamId"
      :group-id="groupId"
      :template-id="callbackTemplateId"
      @on-close="closeCallbackTemplateDialog"
    />
  </div>
</template>
<script lang="ts">
import SetRecordTemplate from './dialogs/SetRecordTemplate.vue'
import SetCallBackTemplate from './dialogs/SetCallBackTemplate.vue'
import { RecordTemplate } from '@/type/template'
import { getStream, getStreamRecordTemplate, getStreamCallBackTemplate } from '@/api/stream'
import { getGroupRecordTemplate, getGroupCallbackTemplate } from '@/api/group'
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component({
  name: 'TemplateBind',
  components: {
    SetRecordTemplate,
    SetCallBackTemplate
  }
})
export default class extends Vue {
  @Prop() private groupId?: string
  @Prop() private streamId?: string
  @Prop() private deviceId?: String
  private loading = {
    record: false,
    callback: false
  }
  private template: Record<any, Array<RecordTemplate>> = {
    callbackTemplate: [],
    recordTemplate: []
  }
  private setRecordTemplateDialog = false
  private setCallbackTemplateDialog = false
  private recordTemplateId = ''
  private callbackTemplateId = ''

  private async mounted() {
    try {
      this.loading.record = true
      this.loading.callback = true
      this.template.recordTemplate = []
      this.template.callbackTemplate = []
      if (this.streamId) {
        const resRecord = await getStreamRecordTemplate({ deviceId: this.streamId })
        this.template.recordTemplate.push(resRecord)
        const resCallback = await getStreamCallBackTemplate({ deviceId: this.streamId })
        this.template.callbackTemplate.push(resCallback)
      } else {
        const resRecord = await getGroupRecordTemplate({ groupId: this.groupId })
        this.template.recordTemplate.push(resRecord)
        const resCallback = await getGroupCallbackTemplate({ groupId: this.groupId })
        this.template.callbackTemplate.push(resCallback)
      }
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.record = false
      this.loading.callback = false
    }
  }

  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
    if (!this.template.recordTemplate.length) {
      this.recordTemplateId = ''
    } else {
      this.recordTemplateId = this.template.recordTemplate[0].templateId!
    }
  }

  private async closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
    try {
      this.loading.record = true
      this.template.recordTemplate = []
      if (this.streamId) {
        const res = await getStreamRecordTemplate({ deviceId: this.streamId })
        this.template.recordTemplate.push(res)
      } else {
        const res = await getGroupRecordTemplate({ groupId: this.groupId })
        this.template.recordTemplate.push(res)
      }
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.record = false
    }
  }

  private setCallbackTemplate() {
    this.setCallbackTemplateDialog = true
    if (!this.template.callbackTemplate.length) {
      this.callbackTemplateId = ''
    } else {
      this.callbackTemplateId = this.template.callbackTemplate[0].templateId!
    }
  }

  private async closeCallbackTemplateDialog() {
    this.setCallbackTemplateDialog = false
    try {
      this.loading.callback = true
      this.template.callbackTemplate = []
      if (this.streamId) {
        const res = await getStreamCallBackTemplate({ deviceId: this.streamId })
        this.template.callbackTemplate.push(res)
      } else {
        const res = await getGroupCallbackTemplate({ groupId: this.groupId })
        this.template.callbackTemplate.push(res)
      }
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.callback = false
    }
  }
}
</script>

<style lang="scss" scoped>
.template-edit {
  float: right;
  padding: 0;
  margin: 0;
}
</style>
