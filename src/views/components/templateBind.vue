<template>
  <div>
    <el-card>
      <el-button v-permission="['*']" type="text" class="template-edit" @click="setRecordTemplate">编辑</el-button>
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
    </el-card>
    <el-card style="margin-top:20px;">
      <el-button v-permission="['*']" type="text" class="template-edit" @click="setCallbackTemplate">编辑</el-button>
      <info-list title="回调模板">
        <el-table v-loading="loading.callback" :data="template.callbackTemplate" fit empty-text="该设备或组没有绑定回调模板">
          <el-table-column prop="templateName" label="模板名称" />
          <el-table-column prop="recordNotifyUrl" label="回调URL" />
          <el-table-column prop="callbackKey" label="回调Key" />
        </el-table>
      </info-list>
    </el-card>
    <el-card style="margin-top: 20px;">
      <el-button v-permission="['*']" type="text" class="template-edit" @click="setAITemplate">编辑</el-button>
      <info-list title="AI模板">
        <el-table v-loading="loading.ai" :data="template.aiTemplate" empty-text="该设备或组没有绑定AI模板" fit>
          <el-table-column prop="templateName" label="模板名称" />
          <el-table-column prop="description" label="模板概要" />
          <el-table-column prop="enableType" label="启动方式">
            <template slot-scope="{row}">
              {{ row.enableType === 1 ? '自动开启' : '手动开启' }}
            </template>
          </el-table-column>
        </el-table>
      </info-list>
    </el-card>
    <SetRecordTemplate
      v-if="setRecordTemplateDialog"
      :group-id="groupId"
      :device-id="deviceId"
      :in-protocol="inProtocol"
      :template-id="recordTemplateId"
      @on-close="closeSetRecordTemplateDialog"
    />
    <SetCallBackTemplate
      v-if="setCallbackTemplateDialog"
      :in-protocol="inProtocol"
      :device-id="deviceId"
      :group-id="groupId"
      :template-id="callbackTemplateId"
      @on-close="closeCallbackTemplateDialog"
    />
    <SetAITemplate
      v-if="setAITemplateDialog"
      :in-protocol="inProtocol"
      :group-id="groupId"
      :device-id="deviceId"
      :template-id="aiTemplateId"
      @on-close="closeSetAITemplateDialog"
    />
  </div>
</template>
<script lang="ts">
import SetRecordTemplate from './dialogs/SetRecordTemplate.vue'
import SetCallBackTemplate from './dialogs/SetCallBackTemplate.vue'
import SetAITemplate from './dialogs/SetAITemplate.vue'
import { RecordTemplate } from '@/type/template'
import { getGroupRecordTemplate, getGroupCallbackTemplate } from '@/api/group'
import { getDeviceRecordTemplate, getDeviceCallbackTemplate } from '@/api/device'
import { getAIBind } from '@/api/template'
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component({
  name: 'TemplateBind',
  components: {
    SetRecordTemplate,
    SetCallBackTemplate,
    SetAITemplate
  }
})
export default class extends Vue {
  @Prop() private groupId?: string
  @Prop() private deviceId?: String
  @Prop() private inProtocol?: String
  private loading = {
    record: false,
    callback: false,
    ai: false
  }
  private template: Record<any, Array<RecordTemplate>> = {
    callbackTemplate: [],
    recordTemplate: [],
    aiTemplate: []
  }
  private setRecordTemplateDialog = false
  private setCallbackTemplateDialog = false
  private setAITemplateDialog = false
  private recordTemplateId = ''
  private callbackTemplateId = ''
  private aiTemplateId = ''

  private async mounted() {
    this.getStreamTemplate()
    this.getRecordTemplate()
    this.getAITemplate()
  }

  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
    if (!this.template.recordTemplate.length) {
      this.recordTemplateId = ''
    } else {
      this.recordTemplateId = this.template.recordTemplate[0].templateId!
    }
  }

  private setAITemplate() {
    this.setAITemplateDialog = true
    if (!this.template.aiTemplate.length) {
      this.aiTemplateId = ''
    } else {
      this.aiTemplateId = this.template.aiTemplate[0].templateId!
    }
  }

  private async getRecordTemplate() {
    try {
      this.loading.record = true
      this.template.recordTemplate = []
      if (this.groupId) {
        const res = await getGroupRecordTemplate({ groupId: this.groupId })
        this.template.recordTemplate.push(res)
      } else {
        const res = await getDeviceRecordTemplate({ deviceId: this.deviceId, inProtocol: this.inProtocol })
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

  private async getAITemplate() {
    try {
      this.loading.ai = true
      this.template.aiTemplate = []
      if (this.groupId) {
        const res = await getAIBind({ groupId: this.groupId })
        this.template.aiTemplate.push(res)
      } else {
        const res = await getAIBind({ deviceId: this.deviceId, inProtocol: this.inProtocol })
        this.template.aiTemplate.push(res)
      }
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.ai = false
    }
  }

  private async closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
    this.getRecordTemplate()
  }

  private async closeSetAITemplateDialog() {
    this.setAITemplateDialog = false
    this.getAITemplate()
  }

  private setCallbackTemplate() {
    this.setCallbackTemplateDialog = true
    if (!this.template.callbackTemplate.length) {
      this.callbackTemplateId = ''
    } else {
      this.callbackTemplateId = this.template.callbackTemplate[0].templateId!
    }
  }

  private async getStreamTemplate() {
    try {
      this.loading.callback = true
      this.template.callbackTemplate = []
      if (this.groupId) {
        const res = await getGroupCallbackTemplate({ groupId: this.groupId })
        this.template.callbackTemplate.push(res)
      } else {
        const res = await getDeviceCallbackTemplate({ deviceId: this.deviceId, inProtocol: this.inProtocol })
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

  private async closeCallbackTemplateDialog() {
    this.setCallbackTemplateDialog = false
    this.getStreamTemplate()
  }
}
</script>

<style lang="scss" scoped>
.template-edit {
  float: right;
  padding: 0;
  margin-right: 5px;
}
</style>
