<template>
  <!--回调模板信息-->
  <div v-loading="loading" class="detail__section">
    <div class="detail__title">
      回调模板信息
      <div class="detail__buttons">
        <el-button v-if="!isVGroup && checkPermission(['AdminDevice'])" v-permission="['*']" type="text" @click="setCallbackTemplate">配置</el-button>
      </div>
    </div>
    <el-descriptions v-if="template" :column="2">
      <el-descriptions-item label="模板名称">
        {{ template.templateName }}
      </el-descriptions-item>
      <el-descriptions-item v-if="template.recordNotifyUrl" label="录制回调URL">
        {{ template.recordNotifyUrl }}
      </el-descriptions-item>
      <el-descriptions-item v-if="template.deviceStatusUrl" label="设备状态回调URL">
        {{ template.deviceStatusUrl }}
      </el-descriptions-item>
      <el-descriptions-item v-if="template.streamStatusUrl" label="流状态回调URL">
        {{ template.streamStatusUrl }}
      </el-descriptions-item>
      <el-descriptions-item v-if="template.aiEventNotifyUrl" label="AI事件通知回调URL">
        {{ template.aiEventNotifyUrl }}
      </el-descriptions-item>
      <el-descriptions-item label="回调Key">
        {{ template.callbackKey }}
      </el-descriptions-item>
    </el-descriptions>
    <div v-else-if="!loading.recordTemplate" class="detail__empty-card">
      暂未绑定回调模板
    </div>
    <set-callback-template
      v-if="setCallbackTemplateDialog"
      :device-id="deviceId"
      :template-id="callbackTemplateId"
      @on-close="closeCallbackTemplateDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getDeviceCallbackTemplate } from '@vss/device/api/template'
import SetCallbackTemplate from '@vss/device/components/TemplateDialog/SetCallbackTemplate.vue'
import { checkPermission } from '@vss/base/utils/permission'

@Component({
  name: 'CallbackTemplateInfo',
  components: {
    SetCallbackTemplate
  }
})
export default class extends Vue {
  @Prop() private deviceId: string
  private checkPermission = checkPermission
  private loading = false
  private template: any = null
  private setCallbackTemplateDialog = false
  private callbackTemplateId = ''

  /**
   * 初始化
   */
  private async mounted() {
    this.getCallbackTemplate()
  }

  /**
   * 获取回调模板
   */
  private async getCallbackTemplate() {
    try {
      this.loading = true
      this.template = null
      const res = await getDeviceCallbackTemplate({ deviceId: this.deviceId })
      this.template = res
    } catch (e) {
      if (e && e.code !== 5) {
        this.$message.error(e && e.message)
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 设置回调模板
   */
  private setCallbackTemplate() {
    this.setCallbackTemplateDialog = true
    this.callbackTemplateId = this.template ? this.template.templateId : null
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
