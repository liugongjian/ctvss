<template>
  <DashboardContainer v-loading="loading" title="本周告警趋势分析">
    <div id="weekly-trend-container" :style="`height:${height}vh`" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import DashboardMixin from './DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import { getWeeklyTrend } from '@/api/dashboard'

@Component({
  name: 'DashboardWeeklyTrend',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private weeklyTrendData: any = []
  private chart: any = null
  public intervalTime = 24 * 60 * 60 * 1000
  private loading = false

  private mounted() {
    this.timeChange()
  }
  private timeChange() {
    this.destroy()
    this.setInterval(this.getData.bind(this))
  }

  /**
   * 获取数据
   */
  private async getData() {
    try {
      this.loading = true
      const res = await getWeeklyTrend({})
      this.loading = false
      // const weeklyTrendData = []
      // for (let key in res.data.Bandwidth) {
      //   const item = res.data.Bandwidth[key]
      //   weeklyTrendData.push(
      //     {
      //       time: key.split(' ')[1].slice(0, -3),
      //       type: '入网流量',
      //       value: Math.floor(item['InFlow'] / 1024)
      //     },
      //     {
      //       time: key.split(' ')[1].slice(0, -3),
      //       type: '出网流量',
      //       value: Math.floor(item['OutFlow'] / 1024)
      //     }
      //   )
      // }
      this.weeklyTrendData = res
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
      offsetY: 10,
      itemSpacing: 30,
      items: [
        {
          id: '1',
          name: '人员聚集',
          value: 'OutFlow',
          marker: {
            symbol: 'square',
            style: {
              fill: '#F4C46C'
            },
            spacing: 5
          }
        },
        {
          id: '2',
          name: '未带口罩',
          value: 'InFlow',
          marker: {
            symbol: 'square',
            style: {
              fill: '#6F9FC9'
            },
            spacing: 5
          }
        },
        {
          id: '3',
          name: '人员上访',
          value: 'InFlow',
          marker: {
            symbol: 'square',
            style: {
              fill: '#E56161'
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
    this.chart.scale('value', {
      min: 0,
      max: 100
    })

    this.chart.line().position('time*value').color('type', ['#F4C46C', '#6F9FC9', '#E56161']).shape('smooth')
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
