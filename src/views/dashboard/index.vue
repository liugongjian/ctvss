<template>
  <div
    class="dashboard-wrap"
  >
    <div class="dashboard-wrap__decorator" />
    <div class="dashboard-wrap__header">
      {{ name === 'tzszf' ? '泰州智能视频云' : '中国电信视频云网平台' }}
    </div>
    <DashboardMap />
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
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import DashboardDevice from '@/components/Dashboard/DashboardDevice.vue'
import DashboardFlow from '@/components/Dashboard/DashboardFlow.vue'
import DashboardAlertLive from '@/components/Dashboard/DashboardAlertLive.vue'
import DashboardAlertToday from '@/components/Dashboard/DashboardAlertToday.vue'
import DashboardIntegrityRate from '@/components/Dashboard/DashboardIntegrityRate.vue'
import DashboardMap from '@/components/Dashboard/DashBoardMap.vue'
import DashboardAlertTrend from '@/components/Dashboard/DashboardAlertTrend.vue'

@Component({
  name: 'Dashboard',
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
  get name() {
    return UserModule.name
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
      z-index: 11;
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
      .el-input__inner {
        background: none;
        border-color: #0091ff;
        color: #fff;
        height: 3vh;
        line-height: 3vh;
      }
      .el-input--small .el-input__icon {
        line-height: 3vh;
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
