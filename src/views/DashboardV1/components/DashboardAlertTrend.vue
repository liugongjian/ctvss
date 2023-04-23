<template>
  <DashboardContainer title="最近一周告警趋势分析">
    <div id="weekly-trend-container" :style="`height:${height}vh`" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import { getAuditTrend } from '@/api/dashboard'
import { AlertType } from '@/dics'
import { dateFormatInTable } from '@/utils/date'

declare module 'vue/types/vue' {
  interface Vue {
    [key: string]: any,
  }
}

@Component({
  name: 'DashboardWeeklyTrend',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private weeklyTrendData: any = []
  private chart: any = null
  private loading = false
  private promiseList: any = []

  private mounted() {
    const event6 = getAuditTrend({
      form: 'week',
      event: 6
    })
    const event8 = getAuditTrend({
      form: 'week',
      event: 8
    })
    const event4 = getAuditTrend({
      form: 'week',
      event: 4
    })
    const event5 = getAuditTrend({
      form: 'week',
      event: 5
    })
    const event7 = getAuditTrend({
      form: 'week',
      event: 7
    })
    const event13 = getAuditTrend({
      form: 'week',
      event: 13
    })
    this.promiseList = [event6, event8, event4, event5]
    // TODO: 两当县智慧蜂业特殊处理
    if (this.mainUserId === '90015') {
      this.alertTypeMapping.push(13)
      this.promiseList.push(event13)
    } else {
      this.alertTypeMapping.unshift(7)
      this.promiseList.unshift(event7)
    }
    this.timeChange()
  }
  private timeChange() {
    this.destroy()
    this.setInterval(this.getData.bind(this))
  }
  private alertType = AlertType
  private alertTypeMapping = [6, 8, 4, 5]

  /**
   * 获取数据
   */
  private async getData() {
    try {
      this.loading = true
      const data = await Promise.all(this.promiseList)
      this.loading = false
      const nowTime = new Date().getTime()
      this.weeklyTrendData = []
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < this.alertTypeMapping.length; j++) {
          this.weeklyTrendData.push({
            time: dateFormatInTable('', '', nowTime - i * 3600 * 24 * 1000).slice(5, 10),
            type: this.alertType[this.alertTypeMapping[j]],
            value: 0
          })
        }
      }
      data.forEach((item: any, index) => {
        Object.keys(item.trend).forEach((key) => {
          const currentType = this.alertType[this.alertTypeMapping[index]]
          const tableIndex = this.weeklyTrendData.findIndex((value: any) => {
            return value.time === key.split(' ')[0].slice(-5) && value.type === currentType
          })
          this.weeklyTrendData[tableIndex] = {
            time: key.split(' ')[0].slice(-5),
            type: currentType,
            value: parseInt(item.trend[key])
          }
        })
      })
      this.weeklyTrendData.reverse()
      this.chart ? this.updateChart() : this.drawChart()
    } catch (e) {
      this.loading = false
    }
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
