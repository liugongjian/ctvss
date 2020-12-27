<template>
  <div
    class="dashboard-wrap"
  >
    <img class="dashboard-wrap__bg" :src="require('@/assets/dashboard/header-bg.png')">
    <div class="dashboard-wrap__header">
      泰州智能视频云
    </div>
    <DashboardMap />
    <div class="dashboard-wrap__col dashboard-wrap__col--left">
      <DashboardDevice height="15" />
      <DashboardFlow height="25" />
      <DashboardIntegrityRate height="25" />
    </div>
    <div class="dashboard-wrap__col dashboard-wrap__col--right">
      <DashboardAlertLive height="25" />
      <DashboardAlertToday height="15" />
      <DashboardAlertTrend height="25" />
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
}
</script>

<style lang="scss" scoped>
  .dashboard-wrap {
    position: relative;
    background-color: #232F3E;
    background-repeat: no-repeat;
    background-position: 35% -240px;
    height: 100%;
    width: 100%;
    font-size: 16px;
    min-height: calc(100vh);
    overflow: auto;

    &__bg {
      position: absolute;
      left: 30%;
      top: -200px;
      z-index: 10;
    }
    &__header {
      position: absolute;
      z-index: 11;
      left: 50%;
      font-size: 1.8em;
      color: #98CFFF;
      font-weight: bold;
      background: rgba(35, 59, 88, 0.6);
      border: 2px solid #597B9B;
      border-top: none;
      width: 30%;
      margin-left: -15%;
      padding: 20px 0;
      text-align: center;
      letter-spacing: .5rem;
      border-radius: 0 0 1em 1em;
      box-shadow: 0 0 10px rgba(89, 123, 155, .5);
    }

    &__col {
      position: absolute;
      width: 30%;
      top: 4vh;
      &--left {
        left: 2em;
      }
      &--right {
        position: absolute;
        right: 2em;
      }
      ::v-deep .dashboard-container {
        margin-bottom: 2vh;
      }
    }

    ::v-deep .el-select {
      .el-input__inner {
        background: #33475F;
        border-color: #33475F;
        color: #fff;
      }
    }

    ::v-deep .el-loading-mask {
      background: rgba(35, 59, 88, 0.6);
    }
  }

  @media screen and (max-width: 1700px) {
    .dashboard-wrap {
      font-size: 14px;
    }
  }

  @media screen and (max-width: 1400px) {
    .dashboard-wrap {
      font-size: 12px;
    }
  }
</style>
