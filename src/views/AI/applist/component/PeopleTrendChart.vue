<template>
  <div>
    <div v-if="chartData.length > 0" id="device-container" :style="`height:${height}vh`" />
    <div v-else class="no-data">暂无数据</div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import { getPeopleTrendChart } from '@/api/ai-app'
import DashboardMixin from '@/views/dashboard/mixin/DashboardMixin'
import DashboardContainer from '@/views/dashboard/components/DashboardContainer.vue'
import debounce from '@/utils/debounce'

@Component({
  name: 'PeopleTrendChart',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private isLight?: boolean
  @Prop() private param!: any
  @Prop() private faceLib!: any
  @Prop() private device!: any
  private loading = false
  private debounceHandle = debounce(this.getData, 500)
  private deviceData: any = []
  private chart: any = null
  public intervalTime = 60 * 1000

  private chartData: any = []

  @Watch('param', { deep: true })
  private paramUpdated() {
    if (!this.device) {
      this.debounceHandle()
    }
  }

  @Watch('device', {
    immediate: true,
    deep: true
  })
  private deviceIdUpdate() {
    this.debounceHandle()
  }

  /**
   * 获取数据
   */
  private async getData() {
    try {
      const [startTime, endTime] = this.param.period
      const [confidenceMin, confidenceMax] = this.param.confidence
      const query = {
        appId: this.$route.query.appid,
        startTime,
        endTime,
        confidenceMin,
        confidenceMax,
        faceDb: this.faceLib.id,
        faceIdList: this.param.faceSelected,
        deviceId: this.device.deviceId,
        inProtocol: this.device.inProtocol }
      const { aiReusltDate } = await getPeopleTrendChart(query)
      this.chartData = aiReusltDate.map(item => ({ value: item.count, time: item.Date + item.timeInterval, type: '' }))
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
.no-data{
  height: 200px;
  line-height: 200px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186,198,198);
}
</style>
