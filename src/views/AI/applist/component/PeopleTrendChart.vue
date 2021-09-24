<template>
  <div>
    <div v-show="chartData.length > 0" id="device-container" :style="`height:${height}vh`" />
    <div v-show="chartData.length === 0" class="no-data">暂无数据</div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import { getPeopleTrendChart } from '@/api/ai-app'
import DashboardMixin from '@/views/dashboard/mixin/DashboardMixin'
import DashboardContainer from '@/views/dashboard/components/DashboardContainer.vue'
import debounce from '@/utils/debounce'
import json from '../testdata/terrorism.json'
import json2 from '../testdata/terrorism2.json'

@Component({
  name: 'PeopleTrendChart',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private isLight?: boolean
  @Prop() private param!: any
  @Prop() private faceLib!: any
  @Prop() private device!: any
  @Prop() private appInfo!: any
  private debounceHandle = debounce(this.getData, 500)
  private chart: any = null

  private chartData: any = []

  @Watch('param', { deep: true })
  private paramUpdated() {
    this.conditionalDebounce()
  }
  @Watch('appInfo', { deep: true })
  private appInfoUpdated() {
    this.conditionalDebounce()
  }

  @Watch('device', { deep: true })
  private deviceIdUpdate() {
    this.debounceHandle()
  }

  /**
   * 限制只有device信息才能请求数据,并且点击自定义时间，但未选择具体时间时，不请求数据
   */
  private conditionalDebounce() {
    if (this.device.deviceId.length > 0) {
      (this.param.periodType !== '自定义时间' || this.param.period.length !== 0) && this.debounceHandle()
    }
  }

  /**
   * 获取数据
   */
  private async getData() {
    try {
      const [startTime, endTime] = this.param.period
      const [confidenceMin, confidenceMax] = this.param.confidence
      const query = {
        appId: this.appInfo.id,
        startTime,
        endTime,
        confidenceMin,
        confidenceMax,
        faceDb: this.faceLib.id,
        faceIdList: this.param.faceSelected,
        deviceId: this.device.deviceId,
        inProtocol: this.device.inProtocol }
      const { aiReusltDate } = await getPeopleTrendChart(query)
      this.chartData = aiReusltDate.map(item => ({ value: item.count, time: item.Date + item.timeInterval, type: '人员聚集' }))
      // 测试
      if (this.chart) {
        this.chartData = json.map(item => ({ value: item.count, time: item.Date + item.timeInterval, type: '人员聚集' }))
      } else {
        this.chartData = json2.map(item => ({ value: item.count, time: item.Date + item.timeInterval, type: '人员聚集' }))
      }
      this.chart ? this.updateChart() : this.drawChart()
      this.refreshChart()
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
  private drawChart() {
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
          fontSize: 8
        },
        formatter: (val: any) => {
          return val.substring(10, 15) + '\n' + val.substring(0, 10)
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

  /**
   * 解决载入或刷新数据时，图表尺寸不更新的问题
   */
  private refreshChart() {
    // resize 为了让图表触发刷新从而自适应尺寸
    const e = document.createEvent('Event')
    e.initEvent('resize', true, true)
    window.dispatchEvent(e)
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
