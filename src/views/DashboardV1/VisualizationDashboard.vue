<template>
  <div
    class="dashboard-wrap"
  >
    <div class="dashboard-wrap__decorator" />
    <div class="dashboard-wrap__header">
      {{ title }}
    </div>
    <!--庆阳铁塔公司180008-->
    <div v-if="mainUserId === '180008'">
      <QYDashBoardMap />
      <div class="dashboard-wrap__col dashboard-wrap__col--left">
        <QYDashboardRoom height="18" />
        <QYDashboardAlertTrend height="18" />
        <QYDashboardDeviceTrend height="18" />
      </div>
      <div class="dashboard-wrap__col dashboard-wrap__col--center">
        <QYDashboardDevice height="19" />
      </div>
      <div class="dashboard-wrap__col dashboard-wrap__col--right">
        <DashboardAlertLive height="19" />
        <QYDashboardImg height="48" />
      </div>
    </div>
    <div v-else>
      <DashboardMapBee v-if="mainUserId === '90015'" />
      <DashboardMap v-else />
      <div class="dashboard-wrap__col dashboard-wrap__col--left">
        <DashboardDevice height="19" />
        <DashboardFlow height="19" />
        <DashboardIntegrityRate height="19" />
      </div>
      <div class="dashboard-wrap__col dashboard-wrap__col--right">
        <DashboardAlertLive height="19" />
        <DashboardAlertToday height="19" />
        <DashboardAlertTrend height="19" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import DashboardDevice from './components/DashboardDevice.vue'
import DashboardFlow from './components/DashboardFlow.vue'
import DashboardAlertLive from './components/DashboardAlertLive.vue'
import DashboardAlertToday from './components/DashboardAlertToday.vue'
import DashboardIntegrityRate from './components/DashboardIntegrityRate.vue'
import DashboardMap from './components/DashBoardMap.vue'
import DashboardMapBee from './components/DashBoardMapBee.vue'
import DashboardAlertTrend from './components/DashboardAlertTrend.vue'
import QYDashBoardMap from './components/QYDashBoardMap.vue'
import QYDashboardDevice from './components/QYDashboardDevice.vue'
import QYDashboardAlertTrend from './components/QYDashboardAlertTrend.vue'
import QYDashboardDeviceTrend from './components/QYDashboardDeviceTrend.vue'
import QYDashboardImg from './components/QYDashboardImg.vue'
import QYDashboardRoom from './components/QYDashboardRoom.vue'

@Component({
  name: 'VisualizationDashboard',
  components: {
    DashboardDevice,
    DashboardFlow,
    DashboardAlertLive,
    DashboardAlertToday,
    DashboardMap,
    DashboardMapBee,
    DashboardIntegrityRate,
    DashboardAlertTrend,
    QYDashBoardMap,
    QYDashboardDevice,
    QYDashboardAlertTrend,
    QYDashboardDeviceTrend,
    QYDashboardImg,
    QYDashboardRoom
  }
})
export default class extends Vue {
  get mainUserId() {
    return UserModule.mainUserID
  }

  get title() {
    let title = ''
    switch (this.mainUserId) {
      // case '180008':
      case '180008':
        title = '庆阳铁塔基站智能运维管理平台'
        break
      case '90015':
        title = '两当县智慧蜂业视频AI能力平台'
        break
      default:
        title = '天翼云智能视图服务'
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
      padding: 15px 0 50px;
      text-align: center;
      letter-spacing: 0.5rem;
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

      &--center {
        width: 40%;
        left: 30%;
        bottom: 8vh;
        top: auto;
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
      background: rgba(35, 59, 88, 60%);
    }

    ::v-deep .g2-tooltip {
      opacity: 0.85 !important;
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
