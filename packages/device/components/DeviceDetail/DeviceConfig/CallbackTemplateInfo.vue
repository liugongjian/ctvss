<template>
  <!--回调模板信息-->
  <div v-loading="loading.callbackTemplate" class="detail__section">
    <div class="detail__title">
      回调模板信息
      <div class="detail__buttons">
        <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" v-permission="['*']" type="text" @click="setCallbackTemplate">配置</el-button>
      </div>
    </div>
    <el-descriptions v-if="template.callbackTemplate" :column="2">
      <el-descriptions-item label="模板名称">
        {{ template.callbackTemplate.templateName }}
      </el-descriptions-item>
      <el-descriptions-item v-if="template.callbackTemplate.recordNotifyUrl" label="录制回调URL">
        {{ template.callbackTemplate.recordNotifyUrl }}
      </el-descriptions-item>
      <el-descriptions-item v-if="template.callbackTemplate.deviceStatusUrl" label="设备状态回调URL">
        {{ template.callbackTemplate.deviceStatusUrl }}
      </el-descriptions-item>
      <el-descriptions-item v-if="template.callbackTemplate.streamStatusUrl" label="流状态回调URL">
        {{ template.callbackTemplate.streamStatusUrl }}
      </el-descriptions-item>
      <el-descriptions-item v-if="template.callbackTemplate.aiEventNotifyUrl" label="AI事件通知回调URL">
        {{ template.callbackTemplate.aiEventNotifyUrl }}
      </el-descriptions-item>
      <el-descriptions-item label="回调Key">
        {{ template.callbackTemplate.callbackKey }}
      </el-descriptions-item>
    </el-descriptions>
    <div v-else-if="!loading.recordTemplate" class="detail__empty-card">
      暂未绑定回调模板
    </div>
    <set-callback-template
      v-if="setCallbackTemplateDialog"
      :in-protocol="inProtocol"
      :device-id="deviceId"
      :template-id="callbackTemplateId"
      @on-close="closeCallbackTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getDeviceCallbackTemplate } from '@vss/device/api/device'
import SetCallBackTemplate from '@vss/device/components/TemplateDialog/SetCallbackTemplate.vue'
import { checkPermission } from '@vss/base/utils/permission'

@Component({
  name: 'CallbackTemplateInfo',
  components: {
    SetCallBackTemplate
  }
})
export default class extends Vue {
  private inProtocol = 'gb28181'

  private checkPermission = checkPermission

  private loading = {
    callbackTemplate: false
  }

  private template: any = {
    callbackTemplate: {}
  }

  private setCallbackTemplateDialog = false
  private callbackTemplateId = ''

  private async mounted() {
    this.getCallbackTemplate()
  }

  public get isVGroup() {
    return this.$route.query.inProtocol === 'vgroup'
  }

  /**
   * 获取回调模板
   */
  private async getCallbackTemplate() {
    try {
      this.loading.callbackTemplate = true
      this.template.callbackTemplate = null
      const res = await getDeviceCallbackTemplate({ deviceId: this.deviceId, inProtocol: this.inProtocol })
      this.template.callbackTemplate = res
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading.callbackTemplate = false
    }
  }

  /**
   * 设置回调模板
   */
  private setCallbackTemplate() {
    this.setCallbackTemplateDialog = true
    this.callbackTemplateId = this.template.callbackTemplate ? this.template.callbackTemplate.templateId : null
  }

  /**
   * 关闭设置回调模板
   */
  private closeCallbackTemplateDialog() {
    this.setCallbackTemplateDialog = false
    this.getCallbackTemplate()
  }
}
</script>
