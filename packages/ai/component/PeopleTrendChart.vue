<template>
  <div v-loading="queryLoading.chart">
    <div v-show="chartData.length > 0" id="device-container" :style="`height:${height}vh`" />
    <div v-show="chartData.length === 0" class="no-data">暂无数据</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import { getPeopleTrendChart } from '@vss/device/api/ai-app'
import debounce from '@vss/ai/util/debounce'
import { eachHourOfInterval, parse, isEqual, format } from 'date-fns'

@Component({
  name: 'PeopleTrendChart',
  components: { }
})
export default class extends Vue{
  private isLight?: boolean
  @Prop() private param!: any
  @Prop() private faceLib!: any
  @Prop() private device!: any
  @Prop() private appInfo!: any
  @Prop() public height: any
  private queryLoading: any = {
    chart: false
  }
  private debounceHandle = debounce(this.getData, 500)
  private chart: any = null

  private chartData: any = []

  @Watch('param', { deep: true, immediate: true })
  private paramUpdated() {
    this.conditionalDebounce()
  }
  @Watch('appInfo', { deep: true, immediate: true })
  private appInfoUpdated() {
    this.conditionalDebounce()
  }

  @Watch('device', { deep: true, immediate: true })
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
        startTime: Math.floor(startTime / 1000),
        endTime: Math.floor(endTime / 1000),
        confidenceMin,
        confidenceMax,
        faceDb: this.faceLib.id,
        faceIdList: this.param.faceSelected,
        deviceId: this.device.deviceId,
        inProtocol: this.device.inProtocol
      }
      this.queryLoading.chart = true
      const { aiResultDate } = await getPeopleTrendChart(query)
      // this.chartData = await getPeopleTrendChart(query)
      this.chartData = this.fillChartData(startTime, endTime, aiResultDate)
      // this.chartData = aiReusltDate.map(item => ({ value: item.count, time: item.date + ' ' + item.timeInterval, type: '人员聚集' }))
      // 测试
      // if (this.chart) {
      //   // this.chartData = json.map(item => ({ value: item.count, time: item.Date + ' ' + item.timeInterval, type: '人员聚集' }))
      //   this.chartData = this.fillChartData(startTime, endTime, json)
      // } else {
      //   // this.chartData = json2.map(item => ({ value: item.count, time: item.Date + ' ' + item.timeInterval, type: '人员聚集' }))
      //   this.chartData = this.fillChartData(startTime, endTime, json2)
      // }
      this.chart ? this.updateChart() : this.drawChart()
      this.refreshChart()
    } catch (e) {
      // 异常处理
      console.log(e)
    } finally {
      this.queryLoading.chart = false
    }
  }

  /**
   * 将后端返回的图表数据中缺少的时间点进行补零操作
   */
  public fillChartData(startTime, endTime, rawArr) {
    // 输入为毫秒时间戳，输出为date数组
    const interval = eachHourOfInterval({
      start: startTime,
      end: endTime
    })
    const raw = rawArr.map(item => ({
      ...item,
      time: parse(
        item.date + ' ' + item.timeInterval,
        'yyyy-MM-dd HH:mm:ss',
        new Date()
      )
    }))
    const data = interval.map(item => {
      const joint = raw.filter(dot => isEqual(dot.time, item))
      return joint.length > 0
        ? { value: joint[0].count, time: format(joint[0]?.time, 'yyyy-MM-dd HH:mm:ss'), type: '人员聚集' }
        : { value: 0, time: format(item, 'yyyy-MM-dd HH:mm:ss'), type: '人员聚集' }
    })
    return data
  }

  /**
   * 自适应获取图标y轴刻度
   */
  private getYTickInterval(tickCount: number, scale: any): Array<number> {
    const maxValue = Math.max(...scale.values)
    const vnum = maxValue % tickCount
    let interval = (maxValue - vnum) / tickCount
    if (interval < 1) {
      interval = 1
    }
    if (vnum > interval) {
      return this.getYTickInterval(tickCount - 1, scale)
    }
    const intervalArr = []
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
        return this.getYTickInterval(5, scale)
      }
    })
    this.chart.scale('time', {
      alias: ' ',
      type: 'time',
      mask: 'YYYY-MM-DD HH:mm:ss'
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
          const datearr = val.split(' ')
          return datearr[1] + '\n' + datearr[0]
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
    window.onresize = () => {
      this.chart.forceFit()
    }
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
.no-data {
  height: 200px;
  line-height: 200px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186, 198, 198);
}
</style>
