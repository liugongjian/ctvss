<template>
  <div>
    <div id="device-container" :style="`height:${height}vh`" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import DashboardMixin from '@/views/dashboard/mixin/DashboardMixin'
import DashboardContainer from '@/views/dashboard/components/DashboardContainer.vue'

@Component({
  name: 'PeopleTrendChart',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private isLight?: boolean
  @Prop() private param!: Object
  private deviceTimeRange = '近7天'
  private loading = false

  private timeList: Array<{ label: string; value: number }> = [
    {
      label: '近7天',
      value: 7 * 24 * 3600 * 1000
    },
    {
      label: '近30天',
      value: 30 * 24 * 3600 * 1000
    }
  ]
  private deviceData: any = []
  private userType = 7 * 24 * 3600 * 1000
  private chart: any = null
  public intervalTime = 60 * 1000

  private chartData: any = [
    { time: '00:00', value: 11, type: '人员聚集' },
    { time: '00:15', value: 12, type: '人员聚集' },
    { time: '00:30', value: 20, type: '人员聚集' },
    { time: '00:40', value: 40, type: '人员聚集' },
    { time: '00:50', value: 51, type: '人员聚集' },
    { time: '01:00', value: 61, type: '人员聚集' },
    { time: '02:10', value: 81, type: '人员聚集' },
    { time: '03:20', value: 19, type: '人员聚集' },
    { time: '04:10', value: 31, type: '人员聚集' },
    { time: '05:50', value: 61, type: '人员聚集' },
    { time: '06:00', value: 81, type: '人员聚集' },
    { time: '07:00', value: 91, type: '人员聚集' },
    { time: '12:20', value: 101, type: '人员聚集' },
    { time: '20:00', value: 102, type: '人员聚集' },
    { time: '24:00', value: 108, type: '人员聚集' }
  ]

  @Watch('param', { deep: true })
  private paramUpdated(newVal) {
    if (newVal.periodType === '自定义时间' && !newVal.period.length) {
      // 不请求
      return
    }
    // 这里更新this.chartData
    this.getData()
  }
  private mounted() {
    console.log('mounted:', this.param)// 使用param查询更新图表
    this.getData()
  }
  /**
   * 获取数据
   */
  private async getData() {
    try {
      // this.trendView = new DataSet.DataView().source(this.chartData)
      // this.trendView.transform({
      //   type: 'regression',
      //   method: 'polynomial',
      //   fields: ['time', 'value'],
      //   bandwidth: 1,
      //   // extent: [0, 4],
      //   as: ['time', 'value']
      // })
      this.chart ? this.updateChart() : this.drawChart()
    } catch (e) {
      // 异常处理
      console.log(e)
    }
  }

  /**
   * 自适应获取图标y轴刻度
   */
  private getTickInterval(tickCount: number, scale: any): Array<number> {
    let maxValue = Math.max(...scale.values)
    let vnum = maxValue % tickCount
    let interval = (maxValue - vnum) / tickCount
    if (interval < 1) {
      interval = 1
    }
    if (vnum > interval) {
      return this.getTickInterval(tickCount - 1, scale)
    }
    let intervalArr = []
    for (let i = 1; i <= tickCount; i++) {
      if (interval * i > maxValue) break
      intervalArr.push(interval * i)
    }
    return intervalArr
  }

  /**
   * 更新图表
   */
  private async drawChart() {
    this.chart = new Chart({
      container: 'device-container',
      autoFit: true,
      padding: [20, 30, 45, 70]
    })
    this.chart.data(this.chartData)
    this.chart.scale('value', {
      alias: ' ',
      // formatter: (val: any) => {
      //   return val + '台'
      // },
      range: [0, 1],
      tickMethod: (scale: any) => {
        return this.getTickInterval(5, scale)
      }
    })
    this.chart.axis('value', {
      label: {
        style: {
          fill: '#333',
          fontSize: 12
        }
      },
      title: {
        offset: 60
      },
      grid: {
        line: {
          style: {
            stroke: '#eee'
          }
        }
      }
    })
    this.chart.axis('time', {
      label: {
        style: {
          fill: '#333',
          fontSize: 12
        }
      }
    })
    this.chart.tooltip({
      triggerOn: 'mousemove',
      shared: true
    })
    this.chart.legend(false)
    this.chart.line().position('time*value').color('type', ['#6780B2', '#E4BC00']).shape('smooth')
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
</style>
