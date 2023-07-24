<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-21 10:53:22
 * @LastEditors: liugj liugj@chinatelecom.cn
 * @LastEditTime: 2023-06-08 15:37:42
 * @FilePath: /vss-user-web/src/views/Dashboard/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="container" class="app-container">
    <div class="dashboard-wrap-overview">
      <div class="dashboard-wrap-overview__left">
        <!-- <DashboardDataToday /> -->
        <DashboardTodayData />
        <!-- <DashboardFlowAndDevice :height="34" /> -->
        <DashboardPeriodLine />
        <DashboardResourcePackage v-if="!disableResourceTab" @ai-change="aiChange" />
      </div>
      <!-- <div v-if="aiPakageNum === 0" class="dashboard-wrap-overview__right"> -->
      <div v-if="isSubscribe || aiPakageNum > 0" class="dashboard-wrap-overview__right">
        <!-- <DashboardAIAbility /> -->
        <DashboardAIAnalysis />
        <DashboardAIAlert />
        <!-- <DashboardAlertLive :is-light="true" />
        <DashboardAlertToday :is-light="true" :height="19" /> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardAlertToday from '@/views/Dashboard/components/DashboardAlertToday.vue'
import DashboardAlertLive from '@/views/Dashboard/components/DashboardAlertLive.vue'
import DashboardFlowAndDevice from '@/views/Dashboard/components/DashboardFlowAndDevice.vue'
import DashboardAIAbility from '@/views/Dashboard/components/DashboardAIAbility.vue'
import DashboardAIAlert from '@/views/Dashboard/components/DashboardAIAlert.vue'
import DashboardAIAnalysis from '@/views/Dashboard/components/DashboardAIAnalysis.vue'
import DashboardDataToday from '@/views/Dashboard/components/DashboardDataToday.vue'
import DashboardResourcePackage from '@/views/Dashboard/components/DashboardResourcePackage.vue'
import { UserModule } from '@/store/modules/user'

import DashboardTodayData from './components/DashboardTodayData.vue'
import DashboardPeriodLine from './components/DashboardPeriodLine.vue'
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
    DashboardTodayData,
    DashboardPeriodLine,
    DashboardAIAnalysis,
    DashboardAIAlert
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
