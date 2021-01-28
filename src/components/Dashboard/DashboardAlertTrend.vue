<template>
  <DashboardContainer title="最近一周告警趋势分析">
    <div id="weekly-trend-container" :style="`height:${height}vh`" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import DashboardMixin from './DashboardMixin'
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

  private mounted() {
    this.timeChange()
  }
  private timeChange() {
    this.destroy()
    this.setInterval(this.getData.bind(this))
  }
  private alertType = AlertType

  /**
   * 获取数据
   */
  private async getData() {
    try {
      this.loading = true
      var event1 = getAuditTrend({
        form: 'week',
        event: 1
      })
      const event2 = getAuditTrend({
        form: 'week',
        event: 2
      })
      const event3 = getAuditTrend({
        form: 'week',
        event: 3
      })
      var data = await Promise.all([event1, event2, event3])
      this.loading = false
      var nowTime = new Date().getTime()
      this.weeklyTrendData = []
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 3; j++) {
          this.weeklyTrendData.push({
            time: dateFormatInTable('', '', nowTime - i * 3600 * 24 * 1000).slice(5, 10),
            type: this.alertType[j + 1],
            value: 0
          })
        }
      }
      data.forEach((item, index) => {
        Object.keys(item.trend).forEach((key) => {
          var tableIndex = this.weeklyTrendData.findIndex((value: any) => {
            return value.time === key.split(' ')[0].slice(-5) && value.type === this.alertType[index + 1]
          })
          this.weeklyTrendData[tableIndex] = {
            time: key.split(' ')[0].slice(-5),
            type: this.alertType[index + 1],
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
      items: [
        {
          name: '未戴口罩',
          value: '未戴口罩',
          marker: {
            symbol: 'square',
            style: {
              fill: '#FF810C'
            },
            spacing: 5
          }
        },
        {
          name: '人员聚集',
          value: '人员聚集',
          marker: {
            symbol: 'square',
            style: {
              fill: '#0091FF'
            },
            spacing: 5
          }
        },
        {
          name: '人员布控',
          value: '人员布控',
          marker: {
            symbol: 'square',
            style: {
              fill: '#EB155B'
            },
            spacing: 5
          }
        }
      ],
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

    this.chart.line().position('time*value').color('type', ['l(0) 0:#9E10D7 1:#EB155B', 'l(0) 0:#14B7E1 1:#0091FF', 'l(0) 0:#EDDE12 1:#FF810C']).shape('smooth')
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
