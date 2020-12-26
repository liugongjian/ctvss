<template>
  <DashboardContainer title="设备状态统计">
    <template v-slot:header>
      最近12小时
    </template>
    hsdjfhdsjf
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardContainer from './DashboardContainer.vue'
import { getDeviceStates } from '@/api/dashboard'

@Component({
  name: 'DashboardDevice',
  components: { DashboardContainer }
})
export default class extends Vue {
  private mounted() {
    this.getDeviceStates()
  }

  private async getDeviceStates() {
    await getDeviceStates(null)
  }
}
</script>
<style lang="scss" scoped>

</style>
