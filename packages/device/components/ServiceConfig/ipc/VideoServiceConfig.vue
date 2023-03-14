<template>
  <div class="video-service-config">
    <billing-mode-selector
      :v-model="billingModeForm"
      :resource-type="resourceTypeEnum.Video"
      :device-stream-size="deviceStreamSize"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, ResourceTypeEnum } from '@vss/device/enums/billing'
import BillingModeSelector from '../components/BillingModeSelector.vue'
@Component({
  name: 'IpcVideoServiceConfig',
  components: {
    BillingModeSelector
  }
})
export default class extends Vue {
  @Prop({ default: 0 })
  private deviceStreamSize: number

  private resourceTypeEnum = ResourceTypeEnum
  private billingModeForm = {
    [BillingEnum.BillingMode]: BillingModeEnum.Packages,
    [BillingEnum.RecordStream]: 1,
    [BillingEnum.RecordTemplateId]: '',
    [BillingEnum.RecordTemplateName]: '',
    [BillingEnum.ResourceId]: '',
    [BillingEnum.Resource]: {}
  }
}
</script>