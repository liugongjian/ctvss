<template>
  <DashboardContainer title="今日告警统计">
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

  private mounted() {
    this.setInterval(this.getDeviceStates)
  }

  /**
   * 获取数据
   */
  private async getDeviceStates() {
    const data = await getAuditTrend({ form: 'day' })
    this.chartData = [
      { type: '未带口罩', value: parseInt(data.trend[6] || 0) },
      { type: '人员聚集', value: parseInt(data.trend[2] || 0) },
      { type: '人员布控', value: parseInt(data.trend[4] || 0) },
      { type: '吸烟检测', value: parseInt(data.trend[5] || 0) }
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
      height: 120,
      padding: [10, 40, 10, 85]
    })

    this.chart.axis('type', {
      title: null,
      tickLine: null,
      line: null,
      label: {
        offset: 25,
        style: {
          fill: '#D8D8D8',
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
      .color('type', ['l(0) 0:#EDDE12 1:#FF810C', 'l(0) 0:#14B7E1 1:#0091FF', 'l(0) 0:#9E10D7 1:#EB155B', 'l(0) 0:#B0FF1C 1:#1CB500'])
      .label('value', {
        style: {
          fill: '#33DBE3'
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
