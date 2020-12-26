<template>
  <div
    class="dashboard-wrap"
    :style="`background-image: url(${require('@/assets/dashboard/header-bg.png')})`"
  >
    <div class="dashboard-wrap__header">
      智能视频云
    </div>
    <div class="dashboard-wrap__col dashboard-wrap__col--left">
      <DashboardDevice />
      <!-- <DashboardDevice /> -->
      <DashboardIntegrityRate />
      <!-- <DashboardFlow />
      <DashboardDevice /> -->
    </div>
    <div class="dashboard-wrap__col dashboard-wrap__col--right">
      <DashboardAlertLive />
      <DashboardAlertToday />
      <DashboardDevice />
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

@Component({
  name: 'Dashboard',
  components: {
    DashboardDevice,
    DashboardFlow,
    DashboardAlertLive,
    DashboardAlertToday,
    DashboardIntegrityRate
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
    background-color: #232F3E;
    background-repeat: no-repeat;
    background-position: 35% -240px;
    height: 100%;
    font-size: 16px;
    min-height: calc(100vh - 50px);

    &__header {
      font-size: 1.8rem;
      color: #98CFFF;
      font-weight: bold;
      background: rgba(35, 59, 88, 0.6);
      border: 2px solid #597B9B;
      border-top: none;
      width: 30%;
      margin: 0 auto;
      padding: 20px 0;
      text-align: center;
      letter-spacing: .5rem;
      border-radius: 0 0 1rem 1rem;
      box-shadow: 0 0 10px rgba(89, 123, 155, .5);
    }

    &__col {
      position: absolute;
      width: 30%;
      &--left {
        left: 2rem;
      }
      &--right {
        position: absolute;
        right: 2rem;
      }
      ::v-deep .dashboard-container {
        margin-bottom: 2rem;
      }
    }

    ::v-deep .el-select {
      .el-input__inner {
        background: #33475F;
        border-color: #33475F;
        color: #fff;
      }
    }
  }
</style>
