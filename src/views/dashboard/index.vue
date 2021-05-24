<template>
  <div id="container" class="app-container">
    <div class="dashboard-wrap-overview">
      <div class="dashboard-wrap-overview__left">
        <DashboardDataToday />
        <DashboardFlowAndDevice :height="34" />
        <DashboardResourcePackage @ai-change="aiChange" />
      </div>
      <div v-if="aiPakageNum > 0" class="dashboard-wrap-overview__right">
        <DashboardAIAbility />
        <DashboardAlertLive :is-light="true" />
        <DashboardAlertToday :is-light="true" :height="19" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DashboardAlertToday from '@/views/dashboard/components/DashboardAlertToday.vue'
import DashboardAlertLive from '@/views/dashboard/components/DashboardAlertLive.vue'
import DashboardFlowAndDevice from '@/views/dashboard/components/DashboardFlowAndDevice.vue'
import DashboardAIAbility from '@/views/dashboard/components/DashboardAIAbility.vue'
import DashboardDataToday from '@/views/dashboard/components/DashboardDataToday.vue'
import DashboardResourcePackage from '@/views/dashboard/components/DashboardResourcePackage.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'Dashboard',
  components: {
    DashboardAlertLive,
    DashboardAlertToday,
    DashboardFlowAndDevice,
    DashboardAIAbility,
    DashboardDataToday,
    DashboardResourcePackage
  }
})
export default class extends Vue {
  private aiPakageNum = 0
  private aiChange(packageData: any) {
    this.aiPakageNum = packageData.ai
  }
}
</script>
