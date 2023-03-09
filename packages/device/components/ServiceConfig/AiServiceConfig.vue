<template>
  <div class="video-service-config">
    <billing-mode-selector
      :v-model="billingModeForm"
      :resource-type="resourceTypeEnum.AI"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { BillingEnum, BillingModeEnum, ResourceTypeEnum } from '@vss/device/enums/billing'
import BillingModeSelector from './components/BillingModeSelector.vue'
@Component({
  name: 'AiServiceConfig',
  components: {
    BillingModeSelector
  }
})
export default class extends Vue {
  private resourceTypeEnum = ResourceTypeEnum

  private billingModeForm = {
    [BillingEnum.BillingMode]: BillingModeEnum.Packages,
    [BillingEnum.Resource]: ''
  }
}
</script>

<style lang="scss" scoped>
.video-service-config {
}
</style>