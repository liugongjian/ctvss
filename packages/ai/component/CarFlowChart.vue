<template>
  <div v-loading="queryLoading.chart">
    <el-tag v-if="chartInfo.vehiclesThreshold.length" style="margin-right: 20px;">车辆数阈值：{{ chartInfo.vehiclesThreshold }}</el-tag>
    <el-tag v-if="chartInfo.timeSlide.length">时间窗口：{{ chartInfo.timeSlide }}小时</el-tag>
    <div v-show="chartData.length > 0" id="car-container" :style="`height:${height}vh`" />
    <div v-show="chartData.length === 0" class="no-data">暂无数据</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Chart, registerAction, registerInteraction } from '@antv/g2'
import ScaleZoom from './chartAction/scale-zoom'
import ScaleTranslate from './chartAction/scale-translate'
import isWheelDown from './chartAction/mouse-util'
import { getVehiclesAlarmStatic } from '@vss/device/api/ai-app'
import debounce from '@vss/ai/util/debounce'
import { fromUnixTime, format } from 'date-fns'
import _ from 'lodash'

@Component({
  name: 'CarFlowChart',
  components: {  }
})
export default class extends Vue {
  private isLight?: boolean
  @Prop() private param!: any
  @Prop() private faceLib!: any
  @Prop() private device!: any
  @Prop() private appInfo!: any
  @Prop() public height: any
  private queryLoading: any = {
    chart: false
  }
  private chartInfo: any = { vehiclesThreshold: '', timeSlide: '' }
  private debounceHandle = debounce(this.getData, 500)
  private chart: any = null

  private chartData: any = []

  private unvisibleChartData: any = []

  @Watch('param', { deep: true, immediate: true })
  private async paramUpdated() {
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
      this.prioritiseAlarm(res)
      this.chartInfo.vehiclesThreshold = res.vehiclesThreshold
      this.chartInfo.timeSlide = res.timeSlide
      this.chart ? this.updateChart() : this.drawChart()
      this.refreshChart()
    } catch (e) {
      // 异常处理
      console.log(e)
    } finally {
      this.queryLoading.chart = false
    }
  }

  /** 调整数据顺序
   * 优先绘制alarm
   * */
  private prioritiseAlarm(res) {
    // @ts-ignore
    const temp = res.alarmChartData.map(item => ({ ...item, value: parseInt(item.value), time: Date.parse(new Date(item.time)) }))
    const alarms = temp.filter(item => item.type === 'alarm')
    const normals = temp.filter(item => item.type === 'normal')
    const alarmsLessOrigin = []// 对没有alarm数值的时间进行补零
    const normalEqualAlarm = []// 找出alarm === normal的时间点，单独调整顺序，优先渲染normal
    normals.forEach(normal => {
      const temp1 = alarms.filter(alarm => normal.time === alarm.time)
      const temp2 = alarms.filter(alarm => normal.time === alarm.time && normal.value === alarm.value)
      if (temp1.length === 0) {
        alarmsLessOrigin.push({ time: normal.time, type: 'alarm', value: 0 })
      }
      if (temp2.length > 0) {
        normalEqualAlarm.push(normal)
      }
    })
    // 当normal === alarm时，normal透明
    this.unvisibleChartData = normalEqualAlarm
    this.chartData = [...alarms, ...alarmsLessOrigin, ...normals]
  }
  /**
   * 更新图表
   */
  private drawChart() {
    this.chart = new Chart({
      container: 'car-container',
      autoFit: true,
      padding: [5, 50, 45, 5],
      limitInPlot: true
    })
    this.chart.data(this.chartData)
    this.chart.scale('value', {
      tickLine: null
    })

    this.chart.axis('time', {
      label: {
        textStyle: {
          fill: '#aaaaaa'
        },
        formatter: text => {
          const timestr = format(fromUnixTime(text / 1000), 'HH:mm:ss yyyy-MM-dd')
          return timestr.split(' ')[0] + '\n' + timestr.split(' ')[1]
        }
      },
      tickLine: {
        alignWithLabel: false,
        length: 0
      }
    })
    this.chart.axis('value', false)

    this.chart.legend(false)
    this.chart.tooltip({
      shared: true,
      // title: (title,datum) => format(fromUnixTime(parseInt(datum.time) / 1000), 'yyyy-MM-dd HH:mm:ss'),
      // containerTpl: `<div class="g2-tooltip">
      //                 <div class="g2-tooltip-title" style="margin:10px 0;">{time}</div>
      //                 <ul class="g2-tooltip-list"></ul></div>`,
      // itemTpl: `
      //           <div style="margin-bottom: 10px;list-style:none;">
      //             <span style="background-color:{color};" class="g2-tooltip-marker"></span>
      //             {type}: {value}
      //           </div>
      //         `
      customContent: (time, items) => {
        const container = document.createElement('div')
        container.className = 'g2-tooltip'
        const temp = format(fromUnixTime(time / 1000), 'yyyy-MM-dd HH:mm:ss')
        const title = `<div class="g2-tooltip-title" style="margin-top: 12px;margin-bottom: 12px;">${temp}</div>`
        let listItem = ''
        items.forEach((item) => {
          listItem += `<li class="g2-tooltip-list-item" data-index={index} style="margin-bottom:4px;display:flex;align-items: center;">
                <span style="background-color:${item?.mappingData?.color || item?.color};" class="g2-tooltip-marker"></span>
                <span style="display:inline-flex;flex:1;justify-content:space-between">
                <span style="margin-right: 16px;">${item?.type}:</span><span>${item?.value}</span>
                </span>
            </li>`
        })
        container.innerHTML = title + listItem
        return container
      }
    })

    // 注册交互
    this.registerChartInteraction()
    // 鼠标操作时，页面不滚动
    this.chart.getCanvas().on('mousewheel', ev => { ev.preventDefault() })

    this.chart
      .interval()
      .position('time*value')
      .color('type', type => type === 'normal' ? '#40a9ff' : '#FF0000')
      .tooltip('time*value*type', (time, value, type) => {
        return {
          time: format(fromUnixTime(parseInt(time) / 1000), 'yyyy-MM-dd HH:mm:ss'),
          value,
          type: type === 'normal' ? '新增车辆数' : '累计车辆数'
        }
      })
      .size(1)
      .style('time*value*type', (time, value, type) => {
        const find = this.unvisibleChartData.filter(item => _.isEqual(item, { time, value, type }))
        return find.length > 0 ? { fillOpacity: 0 } : { fillOpacity: 1 }
      })

    this.chart.annotation().line({
      start: ['min', this.chartInfo.vehiclesThreshold],
      end: ['max', this.chartInfo.vehiclesThreshold],
      style: {
        stroke: '#fa8334',
        lineWidth: 1
      }
    })
    this.chart.render()

    window.onresize = () => {
      this.chart.forceFit()
    }
  }

  private registerChartInteraction() {
    registerAction('scale-translate-x', ScaleTranslate)
    registerAction('scale-zoom-x', ScaleZoom)
    registerInteraction('drag-move-x', {
      start: [{ trigger: 'plot:mousedown', action: 'scale-translate-x:start' }],
      processing: [{ trigger: 'plot:mousemove', action: 'scale-translate-x:translate', throttle: { wait: 100, leading: true, trailing: false } }],
      end: [{ trigger: 'plot:mouseup', action: 'scale-translate-x:end' }]
    })
    registerInteraction('view-zoom-x', {
      start: [
        {
          trigger: 'plot:mousewheel',
          isEnable(context) {
            return isWheelDown(context.event)
          },
          action: 'scale-zoom-x:zoomOut',
          throttle: { wait: 100, leading: true, trailing: false }
        },
        {
          trigger: 'plot:mousewheel',
          isEnable(context) {
            return !isWheelDown(context.event)
          },
          action: 'scale-zoom-x:zoomIn',
          throttle: { wait: 100, leading: true, trailing: false }
        }
      ]
    })
    this.chart.interaction('drag-move-x')
    this.chart.interaction('active-region')
    this.chart.interaction('view-zoom-x')
  }
  /**
   * 更新图表,由于changeData不能改变原有图表的度量值，会出现有数据但无图的情况，因此，每次更新图表都需要重绘
   */
  private updateChart() {
    this.chart.destroy()
    this.drawChart()
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
