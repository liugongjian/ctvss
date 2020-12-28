<template>
  <DashboardContainer title="今日告警信息">
    <div ref="chart" :style="`height:${height}vh`" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardMixin from './DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import { Chart } from '@antv/g2'
import { getAuditTrend } from '@/api/dashboard'

@Component({
  name: 'DashboardAlertToday',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private chart: any = null
  private chartData: any = []
  public intervalTime = 0.5 * 60 * 60 * 1000

  private mounted() {
    this.setInterval(this.getDeviceStates)
  }

  /**
   * 获取数据
   */
  private async getDeviceStates() {
    const data = await getAuditTrend({ form: 'day' })
    this.chartData = [
      { type: '人员聚集', value: parseInt(data.trend[2] || 0) },
      { type: '未带口罩', value: parseInt(data.trend[1] || 0) },
      { type: '人员上访', value: parseInt(data.trend[3] || 0) }
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
      height: 120
    })

    this.chart.scale({
      value: {
        max: Math.max(...this.chartData.map((data: any) => data.value)) * 1.2,
        min: 0
      }
    })

    this.chart.axis('type', {
      title: null,
      tickLine: null,
      line: null,
      label: {
        offset: 25,
        style: {
          fill: '#98CFFF',
          fontSize: 14
        }
      }
    })

    this.chart.axis('value', {
      label: null,
      grid: {
        line: {
          style: {
            stroke: '#434659'
          }
        }
      }
    })

    this.chart
      .data(this.chartData)
      .legend(false)
      .coordinate()
      .transpose()

    this.chart
      .interval()
      .position('type*value')
      .color('type', ['#F4C46C', '#6F9FC9', '#E56161'])
      .label('value', {
        style: {
          fill: '#fff'
        },
        offset: 10
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
