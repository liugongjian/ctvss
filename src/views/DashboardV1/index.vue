<template>
  <div id="container" class="app-container">
    <div class="dashboard-wrap-overview">
      <div class="dashboard-wrap-overview__left">
        <DashboardDataToday />
        <DashboardFlowAndDevice :height="34" />
        <DashboardResourcePackage v-if="!disableResourceTab" @ai-change="aiChange" />
      </div>
      <div v-if="isSubscribe || aiPakageNum > 0" class="dashboard-wrap-overview__right">
        <DashboardAIAnalysis />
        <DashboardAIAlert />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardAlertToday from '@/views/DashboardV1/components/DashboardAlertToday.vue'
import DashboardAlertLive from '@/views/DashboardV1/components/DashboardAlertLive.vue'
import DashboardFlowAndDevice from '@/views/DashboardV1/components/DashboardFlowAndDevice.vue'
import DashboardAIAbility from '@/views/DashboardV1/components/DashboardAIAbility.vue'
import DashboardDataToday from '@/views/DashboardV1/components/DashboardDataToday.vue'
import DashboardResourcePackage from '@/views/DashboardV1/components/DashboardResourcePackage.vue'
import { UserModule } from '@/store/modules/user'
import DashboardAIAlert from '@/views/DashboardV1/components/DashboardAIAlert.vue'
import DashboardAIAnalysis from '@/views/DashboardV1/components/DashboardAIAnalysis.vue'
import {  getIsOndemand } from '@/api/billing'



@Component({
  name: 'Dashboard',
  components: {
    DashboardAlertLive,
    DashboardAlertToday,
    DashboardFlowAndDevice,
    DashboardAIAbility,
    DashboardDataToday,
    DashboardResourcePackage,
    DashboardAIAlert,
    DashboardAIAnalysis
  }
})
export default class extends Vue {
  private aiPakageNum = 0
  private isSubscribe = true
  private aiChange(packageData: any) {
    this.aiPakageNum = packageData.ai
  }

  // 隐藏资源包配置
  public get disableResourceTab() {
    return !UserModule.token || (UserModule.tags && UserModule.tags.privateUser && UserModule.tags.privateUser === 'liuzhou')
  }

  private async mounted() {
    try {
      const { isSubscribe } = await getIsOndemand()
      this.isSubscribe = isSubscribe === '1'
    } catch (e){
      console.log(e)
    }
  }
}
</script>
