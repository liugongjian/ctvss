<template>
  <div>
    <component :is="container" title="今日AI告警">
      <div v-show="chartData.length > 0" ref="chart" :style="`height:${height}vh`" />
      <div v-show="chartData.length === 0" class="svg-container">
        <!-- <svg-icon name="nodata" width="200" height="200" /> -->
        <img :src="require('@/icons/svg/nodata.svg')" alt="">
      </div>
      <div v-if="chartData.length === 0" class="no-data">暂无数据</div>
      <slot name="footer"></slot>
    </component>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import DashboardLightContainer from './DashboardLightContainer.vue'
import { Chart } from '@antv/g2'
import { format } from 'date-fns'
import { getAiStats } from '@/api/ai-app'

@Component({
  name: 'DashboardAlertToday',
  components: { DashboardContainer, DashboardLightContainer }
})
export default class extends Mixins(DashboardMixin) {
  private chart: any = null
  private chartData: any = []

  private showChart = true

  @Prop({ default: false })
  private isLight?: boolean

  private get container() {
    return this.isLight ? 'DashboardLightContainer' : 'DashboardContainer'
  }

  private mounted() {
    this.setInterval(this.getTodayAlarms)
  }

  private async getTodayAlarms(){
    const param = {
      startDay: format(new Date(), 'yyyy-MM-dd'),
      endDay: format(new Date(), 'yyyy-MM-dd'),
    }
    const res = await getAiStats(param)
    this.alarmCounts = res.statInfo

    const data = this.alarmCounts.map(alarm => { return { type: alarm.algoName, value: +alarm.number } })
    const dataAbove0 = data.filter(item => +item.value > 0 )
    const res1 = dataAbove0.sort((a, b) => b.value - a.value)
    this.chartData = res1
    this.chart ? this.updateChart() : this.drawChart()
    this.updateChart()// update，否则第一次加载图标后显示缺少色块
  }

  /**
   * 绘制图表
   */
  private drawChart() {
    const $container: any = this.$refs.chart

    this.chart = new Chart({
      container: $container,
      autoFit: true,
      height: 120,
      width: 400,
      padding: [10, 50, 10, 140],
      theme: { maxColumnWidth: 30 }
    })

    // this.chart.option('scrollbar', { type: 'vertical', categorySize: 44 })

    this.chart.axis('type', {
      title: null,
      tickLine: null,
      line: null,
      label: {
        autoHide: false,
        autoEllipsis: false,
        offset: 25,
        style: {
          fill: this.isLight ? '#333' : '#D8D8D8',
          fontSize: 14,
          lineHeight: 18
        }
      }
    })

    this.chart.axis('value', {
      label: null,
      grid: {
        line: {
          style: {
            stroke: this.isLight ? '#EEE' : '#434659'
          }
        }
      }
    })

    // 设置间距
    this.chart.scale('y', {
      tickInterval: 1000
    })

    this.chart
      .data(this.chartData)
      .legend(false)
      .coordinate()
      .transpose()
      .reflect('y')

    this.chart
      .interval()
      .position('type*value')
      .color('type', this.isLight ? '#36A1FF' : ['l(0) 0:#d21414 1:#880000', 'l(0) 0:#EDDE12 1:#FF810C', 'l(0) 0:#14B7E1 1:#0091FF', 'l(0) 0:#9E10D7 1:#EB155B', 'l(0) 0:#B0FF1C 1:#1CB500', 'l(0) 0:#ffe21c 1:#bba300'])
      .label('value', {
        style: {
          fill: this.isLight ? '#4C4C4C' : '#33DBE3'
        },
        offset: 10
      })
      .adjust({ type: 'stack', reverseOrder: true })
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
  display: flex;
  justify-content: center;
  font-size: 14px;
  color: #999999;
}
.svg-container{
  width:100%;
  min-width: 150px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  color: black;
  margin-bottom: 10px;
  margin-top: px;
  img{
    height:100px;
    width: 100px;
    margin-bottom: 10px;
  }
}
</style>
