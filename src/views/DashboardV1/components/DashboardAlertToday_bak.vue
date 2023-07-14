<template>
  <component :is="container" title="今日告警统计">
    <div ref="chart" :style="`height:${height}vh`" />
  </component>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import DashboardLightContainer from './DashboardLightContainer.vue'
// import { UserModule } from '@/store/modules/user'
import { Chart } from '@antv/g2'
import { getAuditTrend } from '@/api/dashboard'
import { AlertType } from '@/dics/index'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'DashboardAlertToday',
  components: { DashboardContainer, DashboardLightContainer }
})
export default class extends Mixins(DashboardMixin) {
  private chart: any = null
  private chartData: any = []

  @Prop({ default: false })
  private isLight?: boolean

  private get container() {
    return this.isLight ? 'DashboardLightContainer' : 'DashboardContainer'
  }

  public get isIndustrialDetection() {
    return UserModule.tags && UserModule.tags.isIndustrialDetection && UserModule.tags.isIndustrialDetection === 'Y'
  }

  private mounted() {
    this.setInterval(this.getDeviceStates)
  }

  /**
   * 获取数据
   */
  private async getDeviceStates() {
    const data = await getAuditTrend({ form: 'day' })
    const temp1 = Object.keys(data.trend).map(key => ({
      type: this.isIndustrialDetection && (key === '37' || key === '10037') ? '工业缺陷检测' : AlertType[key],
      value: parseInt(data.trend[key])
    }))
    const temp2 = temp1.length > 5 ? temp1.sort((x, y) => y.value - x.value).slice(0, 5) : temp1.sort((x, y) => y.value - x.value)
    // this.chartData = temp1.length > 5 ? temp1.sort((x, y) => y.value - x.value).slice(0, 5) : temp1.sort((x, y) => y.value - x.value)
    this.chartData = temp2.map(item => item.type.length > 8 ? { ...item, type: item.type.slice(0, 4) + '\n' + item.type.slice(4) } : item)

    // this.chartData = [
    //   { type: '未带口罩', value: parseInt(data.trend[6] || 0) },
    //   { type: '人员聚集', value: parseInt(data.trend[8] || 6) },
    //   { type: '人员布控', value: parseInt(data.trend[4] || 0) },
    //   { type: '吸烟检测', value: parseInt(data.trend[5] || 0) },
    //   { type: '危险区域检测', value: parseInt(data.trend[9] || 0) }
    // ]
    // TODO: 两当县智慧蜂业特殊处理
    // if (this.mainUserId === '90015') {
    //   this.chartData.push({ type: '蜜蜂密度', value: parseInt(data.trend[13] || 0) })
    // } else {
    //   this.chartData.push({ type: '安全帽反光服检测', value: parseInt(data.trend[7] || 0) })
    // }
    // TODO: Hardcode 300015
    // if (UserModule.mainUserID === '300015') {
    //   this.chartData = [
    //     { type: '人员布控', value: parseInt(data.trend[4] || 0) },
    //     { type: '人员聚集', value: parseInt(data.trend[8] || 0) },
    //     { type: '烟雾明火', value: parseInt(data.trend[10] || 0) },
    //     { type: '车牌识别', value: parseInt(data.trend[17] || 0) }
    //   ]
    // }
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
      .color('type', this.isLight ? '#FA8334' : ['l(0) 0:#d21414 1:#880000', 'l(0) 0:#EDDE12 1:#FF810C', 'l(0) 0:#14B7E1 1:#0091FF', 'l(0) 0:#9E10D7 1:#EB155B', 'l(0) 0:#B0FF1C 1:#1CB500', 'l(0) 0:#ffe21c 1:#bba300'])
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
