<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-21 10:53:22
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-24 10:44:42
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
import DashboardAlertToday from '@/views/Dashboard/components/DashboardAlertToday.vue'
import DashboardAlertLive from '@/views/Dashboard/components/DashboardAlertLive.vue'
import DashboardFlowAndDevice from '@/views/Dashboard/components/DashboardFlowAndDevice.vue'
import DashboardAIAbility from '@/views/Dashboard/components/DashboardAIAbility.vue'
import DashboardDataToday from '@/views/Dashboard/components/DashboardDataToday.vue'
import DashboardResourcePackage from '@/views/Dashboard/components/DashboardResourcePackage.vue'
import DashboardTodayData from './components/DashboardTodayData.vue'
import DashboardPeriodLine from './components/DashboardPeriodLine.vue'
import { Component, Vue } from 'vue-property-decorator'
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
    DashboardPeriodLine
  }
})
export default class extends Vue {
  private aiPakageNum = 0
  private aiChange(packageData: any) {
    this.aiPakageNum = packageData.ai
  }
}
</script>
