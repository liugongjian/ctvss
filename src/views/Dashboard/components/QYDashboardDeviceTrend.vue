<template>
  <DashboardContainer title="设备状态趋势分析">
    <div id="weekly-trend-container2" :style="`height:${height}vh`" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import { AlertType } from '@/dics'

@Component({
  name: 'DashboardWeeklyTrend',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private weeklyTrendData: any = [
    {
      time: '2021-10-30',
      value: 56,
      type: '人工确认'
    },
    {
      time: '2021-10-31',
      value: 43,
      type: '人工确认'
    },
    {
      time: '2021-11-01',
      value: 34,
      type: '人工确认'
    },
    {
      time: '2021-11-02',
      value: 67,
      type: '人工确认'
    },
    {
      time: '2021-11-03',
      value: 45,
      type: '人工确认'
    },
    {
      time: '2021-11-04',
      value: 78,
      type: '人工确认'
    },
    {
      time: '2021-11-05',
      value: 45,
      type: '人工确认'
    },
    {
      time: '2021-10-30',
      value: 76,
      type: '已处理'
    },
    {
      time: '2021-10-31',
      value: 65,
      type: '已处理'
    },
    {
      time: '2021-11-01',
      value: 46,
      type: '已处理'
    },
    {
      time: '2021-11-02',
      value: 55,
      type: '已处理'
    },
    {
      time: '2021-11-03',
      value: 44,
      type: '已处理'
    },
    {
      time: '2021-11-04',
      value: 62,
      type: '已处理'
    },
    {
      time: '2021-11-05',
      value: 81,
      type: '已处理'
    },
    {
      time: '2021-10-30',
      value: 15,
      type: '未处理'
    },
    {
      time: '2021-10-31',
      value: 45,
      type: '未处理'
    },
    {
      time: '2021-11-01',
      value: 7,
      type: '未处理'
    },
    {
      time: '2021-11-02',
      value: 34,
      type: '未处理'
    },
    {
      time: '2021-11-03',
      value: 24,
      type: '未处理'
    },
    {
      time: '2021-11-04',
      value: 34,
      type: '未处理'
    },
    {
      time: '2021-11-05',
      value: 14,
      type: '未处理'
    }
  ]
  private chart: any = null
  private loading = false
  private promiseList: any = []
  private alertType = AlertType
  private alertTypeMapping = [6, 8, 4, 5]

  private mounted() {
    this.drawChart()
  }
  /**
   * 更新图表
   */
  private async drawChart() {
    this.chart = new Chart({
      container: 'weekly-trend-container2',
      autoFit: true
    })
    this.chart.data(this.weeklyTrendData)

    this.chart.tooltip({
      showCrosshairs: true,
      shared: true
    })

    this.chart.legend({
      offsetY: 5,
      // items: this.legendLabel,
      itemName: {
        style: {
          fill: '#eeeeee'
        },
        formatter: (text: any, item: any) => item.name
      }
    })

    this.chart.axis('value', {
      label: {
        formatter: (val: any) => {
          return val
        }
      },
      grid: {
        line: {
          style: {
            stroke: '#434659'
          }
        }
      }
    })

    this.chart.interval().adjust('stack').position('time*value').color('type', ['#40a9ff', '#1890ff', '#096dd9', '#0050b3'])
    this.chart.render()
  }

  /**
   * 更新图表
   */
  private updateChart() {
    this.chart.changeData(this.weeklyTrendData)
  }

  private dateFormat(date: any) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minites = date.getMinutes()
    const seconds = date.getSeconds()
    return [year, month, day].map(item => (item < 10 ? '0' : '') + item).join('-') + ' ' + [hours, minites, seconds].map(item => (item < 10 ? '0' : '') + item).join(':')
  }
}
</script>
<style lang="scss" scoped>
</style>
