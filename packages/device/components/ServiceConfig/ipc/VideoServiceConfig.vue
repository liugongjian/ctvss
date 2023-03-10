<template>
  <div class="video-service-config">
    <billing-mode-selector
      :v-model="billingModeForm"
      :resource-type="resourceTypeEnum.Video"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, ResourceTypeEnum } from '@vss/device/enums/billing'
import BillingModeSelector from '../components/BillingModeSelector.vue'
@Component({
  name: 'IpcVideoServiceConfig',
  components: {
    BillingModeSelector
  }
})
export default class extends Vue {
  private resourceTypeEnum = ResourceTypeEnum
  private billingModeForm = {
    [BillingEnum.BillingMode]: BillingModeEnum.Packages,
    [BillingEnum.RecordStream]: 1,
    [BillingEnum.RecordTemplate]: '',
    [BillingEnum.Resource]: ''
  }
}
</script>