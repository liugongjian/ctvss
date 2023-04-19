<template>
  <div id="container" class="app-container">
    <div class="dashboard-wrap-overview">
      <div class="dashboard-wrap-overview__left">
        <DashboardDataToday />
        <DashboardFlowAndDevice :height="34" />
        <DashboardResourcePackage v-if="!disableResourceTab" @ai-change="aiChange" />
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
import { Component, Vue } from 'vue-property-decorator'
import DashboardAlertToday from '@/views/DashboardV1/components/DashboardAlertToday.vue'
import DashboardAlertLive from '@/views/DashboardV1/components/DashboardAlertLive.vue'
import DashboardFlowAndDevice from '@/views/DashboardV1/components/DashboardFlowAndDevice.vue'
import DashboardAIAbility from '@/views/DashboardV1/components/DashboardAIAbility.vue'
import DashboardDataToday from '@/views/DashboardV1/components/DashboardDataToday.vue'
import DashboardResourcePackage from '@/views/DashboardV1/components/DashboardResourcePackage.vue'
import { UserModule } from '@/store/modules/user'

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

  // 隐藏资源包配置
  public get disableResourceTab() {
    return !UserModule.token || (UserModule.tags && UserModule.tags.privateUser && UserModule.tags.privateUser === 'liuzhou')
  }
}
</script>
