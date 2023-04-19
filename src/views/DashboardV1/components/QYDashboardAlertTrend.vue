<template>
  <DashboardContainer title="告警趋势分析">
    <div id="weekly-trend-container" :style="`height:${height}vh`" />
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
      value: 26,
      type: '正常'
    },
    {
      time: '2021-10-31',
      value: 34,
      type: '正常'
    },
    {
      time: '2021-11-01',
      value: 34,
      type: '正常'
    },
    {
      time: '2021-11-02',
      value: 56,
      type: '正常'
    },
    {
      time: '2021-11-03',
      value: 34,
      type: '正常'
    },
    {
      time: '2021-11-04',
      value: 34,
      type: '正常'
    },
    {
      time: '2021-11-05',
      value: 45,
      type: '正常'
    },
    {
      time: '2021-10-30',
      value: 13,
      type: '非法操作'
    },
    {
      time: '2021-10-31',
      value: 33,
      type: '非法操作'
    },
    {
      time: '2021-11-01',
      value: 23,
      type: '非法操作'
    },
    {
      time: '2021-11-02',
      value: 15,
      type: '非法操作'
    },
    {
      time: '2021-11-03',
      value: 19,
      type: '非法操作'
    },
    {
      time: '2021-11-04',
      value: 12,
      type: '非法操作'
    },
    {
      time: '2021-11-05',
      value: 12,
      type: '非法操作'
    },
    {
      time: '2021-10-30',
      value: 15,
      type: '非法入侵'
    },
    {
      time: '2021-10-31',
      value: 12,
      type: '非法入侵'
    },
    {
      time: '2021-11-01',
      value: 7,
      type: '非法入侵'
    },
    {
      time: '2021-11-02',
      value: 11,
      type: '非法入侵'
    },
    {
      time: '2021-11-03',
      value: 24,
      type: '非法入侵'
    },
    {
      time: '2021-11-04',
      value: 26,
      type: '非法入侵'
    },
    {
      time: '2021-11-05',
      value: 11,
      type: '非法入侵'
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
      container: 'weekly-trend-container',
      autoFit: true
    })
    this.chart.data(this.weeklyTrendData)
    this.chart.scale({
      time: {
        range: [0, 1]
      },
      value: {
        nice: true
      }
    })

    this.chart.tooltip({
      showCrosshairs: true,
      shared: true
    })

    this.chart.legend({
      offsetY: 5,
      itemSpacing: 30,
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

    this.chart.line().position('time*value').color('type', ['l(0) 0:#d21414 1:#880000', 'l(0) 0:#ffe21c 1:#bba300', 'l(0) 0:#B0FF1C 1:#1CB500', 'l(0) 0:#9E10D7 1:#EB155B', 'l(0) 0:#14B7E1 1:#0091FF', 'l(0) 0:#EDDE12 1:#FF810C']).shape('smooth').style({ lineWidth: 3 })
    this.chart.point().position('time*value').color('type', ['l(0) 0:#d21414 1:#880000', 'l(0) 0:#ffe21c 1:#bba300', 'l(0) 0:#B0FF1C 1:#1CB500', 'l(0) 0:#9E10D7 1:#EB155B', 'l(0) 0:#14B7E1 1:#0091FF', 'l(0) 0:#EDDE12 1:#FF810C']).shape('circle').style({
      stroke: '#08233F',
      lineWidth: 1
    })
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
