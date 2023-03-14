<template>
  <div v-if="container" :id="container" class="statistic__chart" :class="chartClasss" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import { TooltipItem } from '@antv/g2/lib/interface'

@Component({
  name: 'DrawChart'
})

export default class extends Vue {
  @Prop() private chartInfo?: any

  private chart: any = {}

  private container = 'container'

  private currentChart: any = null

  private chartClasss = ''

  mounted() {
    this.drawChart()
  }

  @Watch('chartInfo', { immediate: false })
  private onChartInfoChange() {
    this.drawChart()
  }

  private drawChart() {
    const { kind, name } = this.chartInfo

    this.container = name

    this.$nextTick(() => {
      if (kind === 'pie') {
        this.chartClasss = 'pie-chart'
        this.drawPieChart()
      } else if (kind === 'line') {
        this.chartClasss = 'line-chart'
        this.drawLineChart()
      }
    })
  }

  private drawPieChart() {
    const {
      totalDeviceNum,
      onlineNum,
      label,
      name,
      width = 80,
      height = 80
    } = this.chartInfo

    const data = [{ name: '在线', value: Number(onlineNum) }, { name: '离线', value: Number(totalDeviceNum) - Number(onlineNum) }]

    this.currentChart && this.currentChart.destroy()

    this.chart = new Chart({
      container: name,
      width,
      height,
      autoFit: true,
      padding: 0
    })

    this.chart.data(data)

    this.chart.scale('value', {
      formatter: (val: number) => {
        const temp = val / 100 + '%'
        return temp
      }
    })

    this.chart.coordinate('theta', {
      radius: 0.98,
      innerRadius: 0.7
    })

    this.chart.legend(false)
    this.chart.tooltip(false)

    this.chart
      .annotation()
      .text({
        position: ['50%', '50%'],
        content: label,
        style: {
          fontSize: 12,
          fill: '#8c8c8c',
          textAlign: 'center'
        },
        offsetY: -5
      })
      .text({
        position: ['50%', '50%'],
        content: `${((data[0].value / totalDeviceNum) * 100).toFixed(2)}%`,
        style: {
          fontSize: 12,
          fill: '#8c8c8c',
          textAlign: 'center'
        },
        offsetX: 0,
        offsetY: 8
      })

    this.chart
      .interval()
      .adjust('stack')
      .position('value')
      .color('name', ['#FF9B1A', '#D1D1D1'])

    this.chart.render()

    this.currentChart = this.chart
  }

  private drawLineChart() {
    this.currentChart && this.currentChart.destroy()

    const {
      data,
      name
    } = this.chartInfo

    this.chart = new Chart({
      container: name,
      autoFit: true,
      height: 400
    })

    const dataLogs = data.logs.map(item => ({ ...item, usage: Number((item.usage * 100).toFixed(6)) }))

    this.chart.data(dataLogs)

    this.chart.scale({
      day: {
        range: [0, 1]
      },
      usage: {
        min: 0,
        max: 100,
        nice: true
      }
    })

    this.chart.tooltip({
      showCrosshairs: true, // 展示 Tooltip 辅助线
      shared: true,
      // 自定义  https://g2-v4.antv.vision/zh/docs/api/general/tooltip#tooltipcfgcustomitems--items-tooltipitem--tooltipitem
      customItems: (originiItems: TooltipItem[]) => {
        const items: any = originiItems
        items[0].value = items[0].value + '%' // (items[0].value * 100).toFixed(4) + '%'
        items[0].name = '已使用'
        return items
      }
    })

    this.chart.axis('usage', {
      label: {
        formatter: (val) => {
          return val + '%'
        }
      },
      line: {
        style: {
          lineWidth: 1, // 设置线的宽度
          stroke: '#BFBFBF' // 设置线的颜色
        }
      }
    })

    this.chart.line().position('day*usage').label(
      'usage', (value) => {
        return {
          content: value.toFixed(2) + '%'
        }
      }
    ).color('usage', (value) => {
      if (value > data.threshold) {
        return 'red'
      }
      return '#1890ff'
    })

    // 使用 geom.color()   会有个 legend栏来 滑动选择 值， 所以关闭
    this.chart.legend(false)

    // 标注   线  设置
    this.chart.annotation().line({
      top: true,
      start: ['min', data.threshold],
      end: ['max', data.threshold],
      text: {
        content: data.threshold + '%',
        position: 'end',
        style: {
          textAlign: 'end'
        },
        offsetY: -5
      },
      style: {
        stroke: 'red',
        lineWidth: 1.5
      }
    })

    const minData = dataLogs.filter((item: any) => item.warn)
    const minDataLen = minData.length

    // 设置阴影区域
    this.chart.annotation().region({
      start: [minData[0]?.day, 'min'],
      end: [minData[minDataLen - 1]?.day, 'max'],
      style: {
        fill: 'red'
      }
    })

    this.chart.point().position('day*usage')

    this.chart.render()

    this.currentChart = this.chart
  }
}
</script>

<style lang="scss" scoped>
  .pie-chart {
    margin-left: auto;
    margin-right: 10px;
  }
</style>
