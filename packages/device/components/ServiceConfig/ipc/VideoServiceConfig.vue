<template>
  <div class="video-service-config">
    <billing-mode-selector
      ref="configForm"
      v-model="billingModeForm"
      :resource-type="resourceTypeEnum.Video"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, ResourceTypeEnum } from '@vss/device/enums/billing'
import BillingModeSelector from '../components/BillingModeSelector.vue'
@Component({
  name: 'IpcVideoServiceConfig',
  components: {
    BillingModeSelector
  }
})
export default class extends Vue {
  @Inject({ default: () => new Object() })
  private configManager

  private resourceTypeEnum = ResourceTypeEnum
  private billingModeForm = {
    [BillingEnum.BillingMode]: '',
    [BillingEnum.RecordNum]: '1',
    [BillingEnum.TemplateId]: '',
    [BillingEnum.RecordTemplateName]: '',
    [BillingEnum.ResourceId]: '',
    [BillingEnum.Resource]: {}
  }

  @Watch('billingModeForm', { deep: true })
  private async billingModeFormChange(form) {
    const bindingInfo = {
      billingMode: form[BillingEnum.BillingMode]
    }
    switch (form[BillingEnum.BillingMode]) {
      case BillingModeEnum.OnDemand:
        bindingInfo['recordNum'] = form[BillingEnum.RecordNum]
        bindingInfo['templateId'] = form[BillingEnum.TemplateId]
        break
      case BillingModeEnum.Packages:
        bindingInfo['resourceId'] = form[BillingEnum.ResourceId]
        break
    }
    this.$emit('config-change', [bindingInfo])
  }

  private mounted() {
    const videoInfo = this.configManager.initInfo.video
    if (videoInfo && videoInfo.length) {
      const info = videoInfo[0]
      this.billingModeForm[BillingEnum.BillingMode] = info.billingMode
      this.billingModeForm[BillingEnum.RecordNum] = info.recordNum
      this.billingModeForm[BillingEnum.TemplateId] = info.templateId
      this.billingModeForm[BillingEnum.ResourceId] = info.resourceId
    }
  }

  public async validateConfigForm() {
    const config: any = this.$refs.configForm
    await config.validateConfigForm()
    return ''
  }
}
</script>