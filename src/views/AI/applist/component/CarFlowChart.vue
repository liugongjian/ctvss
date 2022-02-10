<template>
  <div v-loading="queryLoading.chart">
    <el-tag style="margin-right:20px;">车辆数阈值：20</el-tag>
    <el-tag>时间阈值：2小时</el-tag>
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
      this.chartData = [{
        time: '13:00',
        type: '101-1000',
        value: 0
      }, {
        time: '13:00',
        type: '1-10',
        value: 10000
      }, {
        time: '13:30',
        type: '101-1000',
        value: 0
      }, {
        time: '13:30',
        type: '1-10',
        value: 10000
      }, {
        time: '14:00',
        type: '101-1000',
        value: 0
      }, {
        time: '14:00',
        type: '1-10',
        value: 10000
      }, {
        time: '14:30',
        type: '101-1000',
        value: 0
      }, {
        time: '14:30',
        type: '1-10',
        value: 10000
      }, {
        time: '15:00',
        type: '101-1000',
        value: 0
      }, {
        time: '15:00',
        type: '1-10',
        value: 10000
      }, {
        time: '15:30',
        type: '101-1000',
        value: 0
      }, {
        time: '15:30',
        type: '1-10',
        value: 10000
      }, {
        time: '16:00',
        type: '101-1000',
        value: 50000
      }, {
        time: '16:00',
        type: '1-10',
        value: 10000
      }]
      this.$nextTick(() => {
        this.chart ? this.updateChart() : this.drawChart()
        this.refreshChart()
      })
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
   * https://antv-2018.alipay.com/zh-cn/g2/3.x/demo/column/column7.html
   */
  private drawChart() {
    this.chart = new Chart({
      container: 'car-container',
      autoFit: true,
      padding: [20, 30, 45, 20]
    })
    this.chart.data(this.chartData)
    this.chart.scale('value', {
      alias: '金额(元)',
      tickLine: null
    })
    this.chart.axis('time', {
      label: {
        textStyle: {
          fill: '#aaaaaa'
        }
      },
      tickLine: {
        alignWithLabel: false,
        length: 0
      }
    })

    this.chart.axis('value', {
      line: {
        lineWidth: 2, // 设置线的宽度
        stroke: '#eee', // 设置线的颜色
        opacity: 0.5
      },
      grid: null,
      label: null,
      title: {
        offset: 80
      }
    })
    this.chart.legend(false)
    // this.chart.interaction('active-region')
    this.chart
      .interval()
      .position('time*value')
      .color('type', ['#FF0000', '#40a9ff'])
      .label('value', {
        content: (data) => {
          // 过滤补0的数据
          return data.type === '101-1000' && data.value === 0 ? '' : data.value
        }
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
