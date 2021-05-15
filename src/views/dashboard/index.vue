<template>
  <div class="app-container">
    <div class="dashboard-wrap">
      <div class="dashboard-wrap__left">
        <div class="dashboard-wrap__item">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>今日数据统计</span>
            </div>
            <div class="dashboard-wrap__item__card__content">
              <div class="dashboard-wrap__cell">
                <p class="dashboard-wrap__cell__head">今日上行流量峰值</p>
                <p class="dashboard-wrap__cell__content">
                  <span class="dashboard-wrap__num">49</span>Mbps
                </p>
              </div>
              <div class="column-line" />
              <div class="dashboard-wrap__cell">
                <p class="dashboard-wrap__cell__head">今日下行流量峰值</p>
                <p class="dashboard-wrap__cell__content">2</p>
              </div>
              <div class="column-line" />
              <div class="dashboard-wrap__cell">
                <p class="dashboard-wrap__cell__head">当前在线设备(在线/总数)</p>
                <p class="dashboard-wrap__cell__content">2</p>
              </div>
            </div>
          </el-card>
        </div>
        <div class="dashboard-wrap__item dashboard-wrap__chart">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>网络流量统计</span>
            </div>
          </el-card>
        </div>
        <div class="dashboard-wrap__item">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>资源包</span>
            </div>
          </el-card>
        </div>
      </div>
      <div class="dashboard-wrap__right">
        <div class="dashboard-wrap__item">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>AI能力</span>
            </div>
          </el-card>
        </div>
        <div class="dashboard-wrap__item">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>AI实时告警信息</span>
            </div>
          </el-card>
        </div>
        <div class="dashboard-wrap__item">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>AI今日告警统计</span>
            </div>
            <DashboardAlertToday
              :is-light="true"
            />
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardAlertToday from '@/views/dashboard/components/DashboardAlertToday.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'Dashboard',
  components: {
    // DashboardDevice,
    // DashboardFlow,
    // DashboardAlertLive,
    DashboardAlertToday
    // DashboardMap,
    // DashboardIntegrityRate,
    // DashboardAlertTrend
  }
})
export default class extends Vue {

}
</script>

<style lang="scss" scoped>
  .el-card {
    ::v-deep {
      .el-card__header {
        padding: 10px 18px;
      }
      .el-card__body {
        padding: 10px 18px;
      }
    }
  }
  .column-line {
    width: 1px;
    border-left: 1px solid #BBBBBB;
  }
  .dashboard-wrap {
    display: flex;
    flex-direction: row;
    position: relative;
    height: 90vh;
    width: 100%;
    font-weight: 600;
    overflow: auto;

    &__item {
      flex: 2;
      padding: 10px;
      flex-shrink: 0;
      &__card {
        height: 100%;
        &__content {
          display: flex;
          flex-direction: row;
        }
      }
    }

    &__cell {
      flex: 1;
      font-weight: normal;
      text-align: center;
      &__head {
        margin: 0;
      }
      &__body {
        .dashboard-wrap__num {
          font-size: 30px;
        }
      }
    }

    &__chart {
      flex: 5;
    }

    &__left {
      display: flex;
      flex: 5;
      flex-direction: column;
    }
    &__right {
      display: flex;
      flex: 3;
      flex-direction: column;
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
