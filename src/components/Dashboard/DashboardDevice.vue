<template>
  <DashboardContainer title="设备状态统计">
    <div class="device-stats">
      <div class="device-stats__chart">
        <div ref="chart" />
      </div>
      <div class="device-stats__data">
        <div class="device-stats__data__chip device-stats__data__chip--online"><label>在线</label><span>{{ stats.online }}</span></div>
        <div class="device-stats__data__chip device-stats__data__chip--offline"><label>离线</label><span>{{ stats.offline }}</span></div>
      </div>
    </div>
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from './DashboardMixin'
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
    this.stats = await getDeviceStates(null)
    this.chartData = [
      { item: '在线', count: parseInt(this.stats.online) },
      { item: '离线', count: parseInt(this.stats.offline) }
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
      innerRadius: 0.8
    })

    this.chart
      .data(this.chartData)
      .legend(false)

    this.chart
      .interval()
      .position('count')
      .color('item', ['#7CC96F', '#E56161'])

    this.chart.annotation().text({
      position: [ '50%', '50%' ],
      content: '设备总数',
      style: {
        fontSize: 16,
        fill: '#98CFFF',
        fontWeight: 300,
        textAlign: 'center'
      },
      offsetY: -30
    })

    this.chart.annotation().text({
      position: [ '50%', '50%' ],
      content: this.stats.sum,
      style: {
        fontSize: 24,
        fill: '#fff',
        fontWeight: 300,
        textAlign: 'center'
      }
    })

    this.chart.annotation().text({
      position: [ '50%', '50%' ],
      content: (parseInt(this.stats.online) / parseInt(this.stats.sum) * 100).toFixed(0) + '%',
      style: {
        fontSize: 22,
        fill: '#7CC96F',
        fontWeight: 300,
        textAlign: 'center'
      },
      offsetY: 30
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
      flex: 3;
    }
    &__data {
      margin-left: 2rem;
      flex: 4;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      &__chip {
        display: flex;
        border: 1px solid #fff;
        padding: 20px 0;
        position: relative;
        overflow: hidden;
        font-size: 1.2rem;
        &::before {
          content: ' ';
          width: 20px;
          height: 20px;
          background: #fff;
          display: block;
          position: absolute;
          top: -10px;
          left: -10px;
          transform: rotate(45deg);
        }

        label {
          flex: 1;
          text-align: center;
        }
        span {
          flex: 1;
          font-weight: bold;
        }

        &--online {
          border-color: $dashboardGreen;
          color: $dashboardGreen;
          &::before {
            background: $dashboardGreen;
          }
        }

        &--offline {
          border-color: $dashboardRed;
          color: $dashboardRed;
          &::before {
            background: $dashboardRed;
          }
        }
      }
    }
  }
</style>
