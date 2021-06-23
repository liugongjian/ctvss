<template>
  <div
    class="dashboard-wrap"
  >
    <div class="dashboard-wrap__decorator" />
    <div class="dashboard-wrap__header">
      {{ title }}
    </div>
    <DashboardMap :main-user-id="mainUserId" />
    <div class="dashboard-wrap__col dashboard-wrap__col--left">
      <DashboardDevice height="19" />
      <DashboardFlow height="19" />
      <DashboardIntegrityRate height="19" />
    </div>
    <div class="dashboard-wrap__col dashboard-wrap__col--right">
      <DashboardAlertLive height="19" />
      <DashboardAlertToday height="19" :main-user-id="mainUserId" />
      <DashboardAlertTrend height="19" :main-user-id="mainUserId" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import DashboardDevice from '@/views/dashboard/components/DashboardDevice.vue'
import DashboardFlow from '@/views/dashboard/components/DashboardFlow.vue'
import DashboardAlertLive from '@/views/dashboard/components/DashboardAlertLive.vue'
import DashboardAlertToday from '@/views/dashboard/components/DashboardAlertToday.vue'
import DashboardIntegrityRate from '@/views/dashboard/components/DashboardIntegrityRate.vue'
import DashboardMap from '@/views/dashboard/components/DashBoardMap.vue'
import DashboardAlertTrend from '@/views/dashboard/components/DashboardAlertTrend.vue'

@Component({
  name: 'VisualizationDashboard',
  components: {
    DashboardDevice,
    DashboardFlow,
    DashboardAlertLive,
    DashboardAlertToday,
    DashboardMap,
    DashboardIntegrityRate,
    DashboardAlertTrend
  }
})
export default class extends Vue {
  get mainUserId() {
    return UserModule.mainUserID
  }

  get title() {
    let title = ''
    switch (this.mainUserId) {
      case '90015':
        title = '两当县智慧蜂业视频AI能力平台'
        break
      default:
        title = '天翼云视频云网平台'
    }
    return title
  }
  private mounted() {
  }
}
</script>

<style lang="scss" scoped>
  .dashboard-wrap {
    position: relative;
    background-color: #000649;
    height: 100%;
    width: 100%;
    font-size: 16px;
    height: 100vh;
    overflow: auto;

    &__decorator {
      position: absolute;
      left: 0;
      top: 0;
      width: 28%;
      height: 80px;
      z-index: 10;
      background: url('./images/left_bg.png') no-repeat;
      background-size: 100% auto;
    }
    &__header {
      position: absolute;
      z-index: 1;
      left: 50%;
      font-size: 1.8em;
      color: #fff;
      font-weight: bold;
      width: 40%;
      margin-left: -20%;
      padding: 15px 0 50px 0;
      text-align: center;
      letter-spacing: .5rem;
      background: url('./images/title_bg.png') no-repeat;
      background-size: 100% 100%;
    }

    &__col {
      position: absolute;
      width: 30%;
      top: 5vh;
      &--left {
        left: 0.5em;
      }
      &--right {
        position: absolute;
        right: 0.5em;
      }
      ::v-deep .dashboard-container {
        margin-bottom: -1.5vh;
      }
    }

    ::v-deep .el-select {
      width: 120px;
      .el-input__inner {
        background: none;
        border-color: transparent;
        color: #fff;
        height: 2.5vh;
        line-height: 2.5vh;
        border-radius: 0;
        color: #65cbd2;
      }
      .el-input--small .el-input__icon {
        line-height: 2.5vh;
        color: #65cbd2;
      }
    }

    ::v-deep .el-loading-mask {
      background: rgba(35, 59, 88, 0.6);
    }

    ::v-deep .g2-tooltip {
      opacity: 0.85!important;
    }
  }

  @media screen and (max-height: 1000px) {
    .dashboard-wrap {
      font-size: 14px;
    }
  }

  @media screen and (max-height: 700px) {
    .dashboard-wrap {
      font-size: 12px;
    }
  }
</style>
