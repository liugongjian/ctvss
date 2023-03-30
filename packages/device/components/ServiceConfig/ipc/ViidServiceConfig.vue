<template>
  <div class="viid-service-config">
    <billing-mode-selector
      ref="configForm"
      v-model="billingModeForm"
      :resource-type="resourceTypeEnum.Viid"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
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
    [BillingEnum.RecordTemplateId]: '',
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
        bindingInfo['templateId'] = form[BillingEnum.RecordTemplateId]
    }
    this.$emit('config-change', [bindingInfo])
  }

  private mounted() {
    const viidInfo = this.configManager.initInfo.viid
    if (viidInfo && viidInfo.length) {
      const info = viidInfo[0]
      this.billingModeForm[BillingEnum.BillingMode] = info.billingMode
      this.billingModeForm[BillingEnum.RecordTemplateId] = info.templateId
      this.billingModeForm[BillingEnum.ResourceId] = info.resourceId
    }
  }

  public async validateConfigForm() {
    const config: any = this.$refs.configForm
    return await config.validateConfigForm()
  }
}
</script>