<template>
  <div v-if="container" :id="container" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import { getIntersectElements } from '@antv/g2/lib/interaction/action/util'
import { TooltipItem } from '@antv/g2/lib/interface'

@Component({
  name: 'DrawChart'
})

export default class extends Vue {
  @Prop() private chartInfo?: any

  private chart: any = {}

  private container: string = 'container'

  private currentChart: any = null

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
        this.drawPieChart()
      } else if (kind === 'line') {
        this.drawLineChart()
      }
    })
  }

  private drawPieChart() {
    const {
      totalDeviceNum,
      onlineNum,
      label,
      name
    } = this.chartInfo

    const data = [{ name: '在线', value: onlineNum }, { name: '离线', value: totalDeviceNum - onlineNum }]

    this.currentChart && this.currentChart.destroy()

    this.chart = new Chart({
      container: name,
      width: 120,
      height: 120,
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
        content: `${((data[0].value / data[1].value) * 100).toFixed(2)}%`,
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
    console.log('line')
    const {
      data,
      name
    } = this.chartInfo

    this.chart = new Chart({
      container: name,
      autoFit: true,
      height: 400
    })

    // const dataLogs = data.logs.map(item => ({ ...item, usage: item.usage * 100 }))
    // console.log('dataLogs--->', dataLogs)
    this.chart.data(data.logs)

    this.chart.scale({
      day: {
        range: [0, 1]
      },
      usage: {
        min: 0,
        max: 100,
        // formatter: (val, item) => {
        //   console.log(val, item)
        // },
        nice: true
        // tickInterval: 0.5
        // type: 'quantize'
      }
    })

    this.chart.tooltip({
      showCrosshairs: true, // 展示 Tooltip 辅助线
      shared: true,
      // 自定义  https://g2-v4.antv.vision/zh/docs/api/general/tooltip#tooltipcfgcustomitems--items-tooltipitem--tooltipitem
      customItems: (originiItems: TooltipItem[]) => {
        const items: any = originiItems
        items[0].value = (items[0].value * 100).toFixed(4) + '%'
        items[0].name = '已使用'
        return items
      }
    })

    this.chart.axis('usage', {
      label: {
        formatter: (val) => {
          return val + '%'
        }
      }
    })

    this.chart.line().position('day*usage').label(
      'usage', (value) => {
        return {
          content: (value * 100).toFixed(4) + '%'
        }
      }, {
        type: 'base'
      }
    )

    // 标注   线  设置
    this.chart.annotation().line({
      top: true,
      start: ['min', '15'],
      end: ['max', '15'],
      text: {
        content: '15%',
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

    this.chart.point().position('day*usage')

    this.chart.render()
  }
}
</script>

<style>

</style>
