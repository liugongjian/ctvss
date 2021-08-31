<template>
  <div>
    <!--录制模版信息-->
    <div class="detail__section">
      <div class="detail__title">
        录制模版信息
        <el-link @click="setRecordTemplate">配置</el-link>
      </div>
      <el-descriptions v-if="template.recordTemplate" :column="2">
        <el-descriptions-item label="模版名称">
          {{ template.recordTemplate.templateName }}
        </el-descriptions-item>
        <el-descriptions-item label="是否启用自动录制">
          {{ template.recordTemplate.recordType === 1 ? '是':'否' }}
        </el-descriptions-item>
        <el-descriptions-item label="录制格式">
          {{ template.recordTemplate.flvParam.enable ? 'flv': '' }}
          {{ template.recordTemplate.hlsParam.enable ? 'hls': '' }}
          {{ template.recordTemplate.mpParam.enable ? 'mp4': '' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <!--回调模版信息-->
    <div class="detail__section">
      <div class="detail__title">
        回调模版信息
        <el-link @click="setCallbackTemplate">配置</el-link>
      </div>
      <el-descriptions v-if="template.callbackTemplate" :column="2">
        <el-descriptions-item label="模版名称">
          {{ template.callbackTemplate.templateName }}
        </el-descriptions-item>
        <el-descriptions-item label="回调URL">
          {{ template.recordTemplate.recordNotifyUrl }}
        </el-descriptions-item>
        <el-descriptions-item label="回调Key">
          {{ template.recordTemplate.callbackKey }}
        </el-descriptions-item>
      </el-descriptions>
      <el-card v-else class="detail__empty-card">
        暂未绑定回调模版, <el-link @click="setCallbackTemplate">立即配置</el-link>
      </el-card>
    </div>

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
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { GroupModule } from '@/store/modules/group'
import { getDeviceRecordTemplate, getDeviceCallbackTemplate } from '@/api/device'
import SetRecordTemplate from '@/views/components/dialogs/SetRecordTemplate.vue'
import SetCallBackTemplate from '@/views/components/dialogs/SetCallBackTemplate.vue'

@Component({
  name: 'DeviceConfig',
  components: {
    SetRecordTemplate,
    SetCallBackTemplate
  }
})
export default class extends Vue {
  @Prop() private deviceId?: String
  @Prop() private inProtocol?: String

  private loading = {
    record: false,
    callback: false,
    ai: false
  }

  private setRecordTemplateDialog = false
  private setCallbackTemplateDialog = false
  private recordTemplateId = ''
  private callbackTemplateId = ''

  private template: any = {
    recordTemplate: null,
    callbackTemplate: null,
    aiTemplate: null
  }

  public get groupId() {
    return GroupModule.group?.groupId
  }

  private async mounted() {
    this.getCallbackTemplate()
    this.getRecordTemplate()
  }

  /**
   * 获取录制模版
   */
  private async getRecordTemplate() {
    try {
      this.loading.record = true
      this.template.recordTemplate = null
      const res = await getDeviceRecordTemplate({ deviceId: this.deviceId, inProtocol: this.inProtocol })
      this.template.recordTemplate = res
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.record = false
    }
  }

  /**
   * 获取回调模版
   */
  private async getCallbackTemplate() {
    try {
      this.loading.callback = true
      this.template.callbackTemplate = null
      const res = await getDeviceCallbackTemplate({ deviceId: this.deviceId, inProtocol: this.inProtocol })
      this.template.callbackTemplate = res
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.callback = false
    }
  }

  /**
   * 设置录制模版
   */
  private setRecordTemplate() {
    this.setRecordTemplateDialog = true
    this.recordTemplateId = this.template.recordTemplate.templateId
  }

  /**
   * 设置回调模版
   */
  private setCallbackTemplate() {
    this.setCallbackTemplateDialog = true
    this.callbackTemplateId = this.template.callbackTemplate.templateId
  }

  /**
   * 关闭设置录制模版
   */
  private closeSetRecordTemplateDialog() {
    this.setRecordTemplateDialog = false
    this.getRecordTemplate()
  }

  /**
   * 关闭设置回调模版
   */
  private closeCallbackTemplateDialog() {
    this.setCallbackTemplateDialog = false
    this.getCallbackTemplate()
  }
}
</script>
<style lang="scss" scoped>
</style>
