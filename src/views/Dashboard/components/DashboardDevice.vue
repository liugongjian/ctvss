<template>
  <DashboardContainer title="设备状态统计">
    <div class="device-stats">
      <div class="device-stats__chart">
        <div ref="chart" class="device-stats__chart__g2" :style="`height:${height - 4}vh`" />
        <div class="device-stats__chart__percent"><span>{{ stats.percent }}</span>%</div>
      </div>
      <div class="device-stats__data">
        <div class="device-stats__data__chip"><label>设备总数</label><div><span :data-text="stats.sum">{{ stats.sum }}</span></div></div>
        <div class="device-stats__data__chip"><label>在线</label><div><span :data-text="stats.online">{{ stats.online }}</span></div></div>
        <div class="device-stats__data__chip"><label>离线</label><div><span :data-text="stats.offline">{{ stats.offline }}</span></div></div>
      </div>
    </div>
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import { Chart } from '@antv/g2'
import { getDeviceStates } from '@/api/dashboard'

@Component({
  name: 'DashboardDevice',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private stats: any = {}
  private chart: any = null
  private chartData: any = []

  private mounted() {
    this.setInterval(this.getDeviceStates)
  }

  /**
   * 获取数据
   */
  private async getDeviceStates() {
    const res = await getDeviceStates(null)
    const sum = Math.max(parseInt(res.sum), parseInt(res.online))
    const online = Math.min(parseInt(res.sum), parseInt(res.online))
    const offline = sum - online
    console.log(sum)
    const percent = sum === 0 ? 0 : Math.round(online / sum * 100)
    this.stats = {
      sum,
      online,
      offline,
      percent
    }
    this.chartData = [
      { item: '在线', count: online },
      { item: '离线', count: offline }
    ]
    this.chart ? this.updateChart() : this.drawChart()
  }

  /**
   * 绘制图表
   */
  private drawChart() {
    const $container: any = this.$refs.chart

    this.chart = new Chart({
      container: $container,
      autoFit: true,
      height: 180
    })

    this.chart.coordinate('theta', {
      radius: 1,
      innerRadius: 0.9
    })

    this.chart
      .data(this.chartData)
      .legend(false)

    this.chart
      .interval()
      .adjust('stack')
      .position('count')
      .color('item', ['l(90) 0:#51E1EB 0.25:#12A1E9 0.5:#4084E8 0.75:#5E63DC 1:#C254D1', 'rgba(0, 0, 0, 0)'])
      .style({
        lineCap: 'round'
      })

    this.chart.render()
  }

  /**
   * 更新图表
   */
  private updateChart() {
    this.chart.changeData(this.chartData)
  }
}
</script>
<style lang="scss" scoped>
  .device-stats {
    display: flex;

    &__chart {
      position: relative;
      flex: 3;
      display: flex;
      align-items: center;
      justify-items: center;
      background: url('../images/circle.png') no-repeat;
      background-size: auto 100%;
      background-position: center;
      padding: 2vh;

      &__g2 {
        width: 100%;
      }

      &__percent {
        position: absolute;
        top: 50%;
        left: 0;
        margin-top: -1.5em;
        width: 100%;
        text-align: center;
        font-size: 1.5em;

        span {
          font-size: 2.5em;
        }
      }
    }

    &__data {
      flex: 4;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      &__chip {
        display: flex;
        flex: 1;
        margin: 1vh;
        align-items: center;
        position: relative;
        overflow: hidden;
        font-size: 1.1em;

        label {
          flex: 1;
          text-align: right;
          color: #d8d8d8;
          margin-right: 1.5vh;
        }

        div {
          flex: 1;

          span {
            font-size: 2em;
            font-weight: 900;
            background: linear-gradient(0, #35b5f5, #925ae0);
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }

        &--online {
          border-color: $dashboardGreen;
          color: $dashboardGreen;

          &:before {
            background: $dashboardGreen;
          }
        }

        &--offline {
          border-color: $dashboardRed;
          color: $dashboardRed;

          &:before {
            background: $dashboardRed;
          }
        }
      }
    }
  }
</style>
