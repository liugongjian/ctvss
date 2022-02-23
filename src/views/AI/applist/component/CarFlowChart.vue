<template>
  <div v-loading="queryLoading.chart">
    <el-tag v-if="chartInfo.vehiclesThreshold.length" style="margin-right:20px;">车辆数阈值：{{ chartInfo.vehiclesThreshold }}</el-tag>
    <el-tag v-if="chartInfo.timeSlide.length">时间窗口：{{ chartInfo.timeSlide }}小时</el-tag>
    <div v-show="chartData.length > 0" id="car-container" :style="`height:${height}vh`" />
    <div v-show="chartData.length === 0" class="no-data">暂无数据</div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import { getVehiclesAlarmStatic } from '@/api/ai-app'
import DashboardMixin from '@/views/dashboard/mixin/DashboardMixin'
import DashboardContainer from '@/views/dashboard/components/DashboardContainer.vue'
import debounce from '@/utils/debounce'

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
  private chartInfo: any = { vehiclesThreshold: '', timeSlide: '' }
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
      const query = {
        appId: this.appInfo.id,
        startTime: Math.floor(startTime / 1000),
        endTime: Math.floor(endTime / 1000),
        deviceId: this.device.deviceId
      }
      this.queryLoading.chart = true
      const res = await getVehiclesAlarmStatic(query)
      this.chartData = res.alarmChartData.map(item => ({ ...item, value: parseInt(item.value) }))
      this.chartInfo.vehiclesThreshold = res.vehiclesThreshold
      this.chartInfo.timeSlide = res.timeSlide
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
   * 更新图表
   * https://antv-2018.alipay.com/zh-cn/g2/3.x/demo/column/column7.html
   */
  private drawChart() {
    this.chart = new Chart({
      container: 'car-container',
      autoFit: true,
      padding: [20, 50, 45, 50]
    })
    this.chart.data(this.chartData)
    this.chart.scale('value', {
      tickLine: null
    })
    this.chart.scale('time', {
      type: 'time',
      mask: 'HH:mm:ss\nYYYY-MM-DD',
      nice: true
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
    this.chart.axis('value', false)

    // this.chart.axis('value', {
    //   line: {
    //     style: {
    //       stroke: '#eee'
    //     }
    //   },
    //   grid: null,
    //   label: null,
    //   title: {
    //     offset: 80
    //   }
    // })
    this.chart.legend(false)
    // this.chart.interaction('active-region')
    this.chart.tooltip(false)
    this.chart
      .interval()
      .position('time*value')
      .color('type', ['#FF0000', '#40a9ff'])
      .label('value', {
        content: (data) => {
          // 过滤补0的数据
          return data.type === 'alarm' && data.value === '0' ? '' : data.value
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
