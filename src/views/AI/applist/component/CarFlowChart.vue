<template>
  <div v-loading="queryLoading.chart">
    <div v-show="chartData.length > 0" id="car-container" :style="`height:${height}vh`" />
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
import { eachHourOfInterval, parse, isEqual, format } from 'date-fns'

@Component({
  name: 'CarFlowChart',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private isLight?: boolean
  @Prop() private param!: any
  @Prop() private faceLib!: any
  @Prop() private device!: any
  @Prop() private appInfo!: any
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
      this.chartData = [
        { time: '03-19', type: 'cars', value: 24000 },
        { time: '03-20', type: 'cars', value: 27000 },
        { time: '03-21', type: 'cars', value: 30000 },
        { time: '03-22', type: 'cars', value: 34000 },
        { time: '03-23', type: 'cars', value: 36000 },
        { time: '03-24', type: 'cars', value: 38000 },
        { time: '03-25', type: 'cars', value: 12000 },
        { time: '03-25', type: 'threshold', value: 15000 }
        // { time: '03-19', cars: 24 },
        // { time: '03-20', cars: 27 },
        // { time: '03-21', cars: 30 },
        // { time: '03-22', cars: 34 },
        // { time: '03-23', cars: 36 },
        // { time: '03-24', cars: 38 },
        // { time: '03-25', cars: 12 },
        // { time: '03-25', threshold: 15 }
      ]
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
   * 更新图表
   */
  private drawChart() {
    this.chart = new Chart({
      container: 'car-container',
      autoFit: true,
      padding: [20, 30, 45, 20]
    })
    this.chart.data(this.chartData)
    this.chart.scale('value', {
      tickLine: null
    })
    this.chart.axis('time')

    this.chart.axis('value', {
      grid: null,
      label: null,
      line: {
        style: {
          stroke: '#D9D9D9'
        }
      }
    })

    this.chart.tooltip({
      shared: true,
      showMarkers: false
    })
    this.chart.interaction('active-region')

    this.chart
      .legend(false)
      .interval()
      // .adjust([{ type: 'stack', reverseOrder: false }])
      .position('time*value')
      // .color('type', ['#40a9ff', '#FF0000']) // ['#FF0000', '#40a9ff']
      .color('type', (type) => {
        return type === 'cars' ? '#40a9ff' : '#FF0000'
      })
      .size(2)
    // this.chart.interval().position('time*threshold').color('#FF0000').size(2)
    // this.chart.interval().position('time*cars').color('#40a9ff').size(2)
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
.no-data{
  height: 200px;
  line-height: 200px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186,198,198);
}
</style>
