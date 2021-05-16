<template>
  <div id="container" class="app-container">
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
                  <span class="dashboard-wrap__num">49</span> Mbps
                </p>
              </div>
              <div class="column-line" />
              <div class="dashboard-wrap__cell">
                <p class="dashboard-wrap__cell__head">今日下行流量峰值</p>
                <p class="dashboard-wrap__cell__content">
                  <span class="dashboard-wrap__num">59</span> Mbps
                </p>
              </div>
              <div class="column-line" />
              <div class="dashboard-wrap__cell">
                <p class="dashboard-wrap__cell__head">当前在线设备(在线/总数)</p>
                <p class="dashboard-wrap__cell__content">
                  <span class="dashboard-wrap__num dashboard-wrap__num__light">139</span><span class="dashboard-wrap__num"> / 339</span>
                </p>
              </div>
            </div>
          </el-card>
        </div>
        <div class="dashboard-wrap__item dashboard-wrap__chart">
          <el-card class="dashboard-wrap__item__card">
            <el-tabs v-model="activePane" @tab-click="1">
              <el-tab-pane label="网络流量统计" name="网络流量统计">
                <el-radio-group v-model="timeRange" size="small">
                  <el-radio-button label="今日" />
                  <el-radio-button label="昨日" />
                  <el-radio-button label="近7日" />>
                  <el-radio-button label="近30日" />>
                </el-radio-group>
                <DashboardFlow
                  :is-light="true"
                  :height="34"
                />
              </el-tab-pane>
              <el-tab-pane label="设备接入统计" name="设备接入统计">设备接入统计</el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
        <div class="dashboard-wrap__item">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>资源包</span>
            </div>
            <div class="dashboard-wrap__item__card__content">
              <div class="dashboard-wrap__cell">
                <p class="dashboard-wrap__cell__head">视频包</p>
                <p class="dashboard-wrap__cell__content">
                  <span class="dashboard-wrap__num">1</span> 个
                </p>
                <el-button type="text">详情</el-button>
              </div>
              <div class="column-line" />
              <div class="dashboard-wrap__cell">
                <p class="dashboard-wrap__cell__head">上行带宽包</p>
                <p class="dashboard-wrap__cell__content">
                  <span class="dashboard-wrap__num">1</span> 个
                </p>
                <el-button type="text">详情</el-button>
              </div>
              <div class="column-line" />
              <div class="dashboard-wrap__cell">
                <p class="dashboard-wrap__cell__head">下行带宽包</p>
                <p class="dashboard-wrap__cell__content">
                  <span class="dashboard-wrap__num">1</span> 个
                </p>
                <el-button type="text">详情</el-button>
              </div>
              <div class="column-line" />
              <div class="dashboard-wrap__cell">
                <p class="dashboard-wrap__cell__head">AI包</p>
                <p class="dashboard-wrap__cell__content">
                  <span class="dashboard-wrap__num">0</span> 个
                </p>
                <el-button type="text">详情</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      <div class="dashboard-wrap__right">
        <div class="dashboard-wrap__item">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>AI能力</span>
              <el-button type="primary" class="dash-btn" @click="$router.push('/dashboard/dashboard')">可视化大屏</el-button>
            </div>
            <p class="dashboard-wrap__cell__head">人脸识别</p>
            <div class="dashboard-wrap__cell__list">
              <el-button size="medium" type="text" @click="goRouter(6)">未带口罩</el-button>
              <div class="column-line" />
              <el-button size="medium" type="text" @click="goRouter(4)">人员布控</el-button>
            </div>
            <p class="dashboard-wrap__cell__head">人体识别</p>
            <div class="dashboard-wrap__cell__list">
              <el-button size="medium" type="text" @click="goRouter(8)">人员聚集</el-button>
              <div class="column-line" />
              <el-button size="medium" type="text" @click="goRouter(5)">吸烟检测</el-button>
              <div class="column-line" />
              <el-button size="medium" type="text" @click="goRouter(7)">安全帽反光服检测</el-button>
            </div>
            <p class="dashboard-wrap__cell__head">场景识别</p>
            <div class="dashboard-wrap__cell__list">
              <el-button size="medium" type="text" @click="goRouter(9)">危险区域检测</el-button>
              <div class="column-line" />
              <el-button size="medium" type="text" @click="goRouter(10)">烟雾明火</el-button>
              <div class="column-line" />
              <el-button size="medium" type="text" @click="goRouter(11)">冲压机</el-button>
            </div>
          </el-card>
        </div>
        <div class="dashboard-wrap__item">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>AI实时告警信息</span>
            </div>
            <DashboardAlertLive
              :is-light="true"
            />
          </el-card>
        </div>
        <div class="dashboard-wrap__item">
          <el-card class="dashboard-wrap__item__card">
            <div slot="header">
              <span>AI今日告警统计</span>
            </div>
            <DashboardAlertToday
              :is-light="true"
              :height="19"
            />
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DashboardAlertToday from '@/views/dashboard/components/DashboardAlertToday.vue'
import DashboardAlertLive from '@/views/dashboard/components/DashboardAlertLive.vue'
import DashboardFlow from '@/views/dashboard/components/DashboardFlow.vue'
import { Component, Vue } from 'vue-property-decorator'
@Component({
  name: 'Dashboard',
  components: {
    DashboardAlertLive,
    DashboardAlertToday,
    DashboardFlow
  }
})
export default class extends Vue {
  private activePane = '网络流量统计'
  private timeRange = '今日'
  private goRouter(type: any) {
    let params: any = {
      path: '/dashboard/ai',
      query: {
        type,
        isLight: true
      }
    }
    this.$router.push(params)
  }
  private mounted() {
    // window.onresize = () => {
    //   const wrap: any = document.getElementsByClassName('dashboard-wrap')
    //   // wrap.style.width = document.body.clientWidth + 'px'
    //   console.log(wrap);
    // }
  }
}
</script>

<style lang="scss" scoped>
  .dash-btn {
    float: right;
    margin-right: -5px;
    margin-top: -5px;
    width: 90px;
    font-size: 6px;
    height: 25px;
    padding: 0;
  }
  .el-card {
    ::v-deep {
      .el-card__header {
        padding: 10px 18px;
        font-weight: 600;
      }
      .el-card__body {
        padding: 15px 18px;
        height: auto;
      }
    }
  }
  .column-line {
    display: inline-block;
    width: 1px;
    border-left: 1px solid #BBBBBB;
  }
  .dashboard-wrap {
    display: flex;
    flex-direction: row;
    position: relative;
    height: 90vh;
    width: 100%;
    overflow: auto;

    &__num {
      font-size: 24px;
      &__light {
        color: #70B603;
      }
    }

    &__item {
      // flex: 2;
      padding: 10px;
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
        font-weight: 550;
      }
      &__list {
        display: flex;
        align-items: center;
        margin: 5px 0;
        .column-line {
          height: 14px;
          margin: 0 15px;
        }
      }
    }

    &__chart {
      // flex: 5;
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
