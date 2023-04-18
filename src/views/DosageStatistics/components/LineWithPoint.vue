<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-17 10:59:01
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-04-18 15:55:15
 * @FilePath: /vss-user-web/src/views/DosageStatistics/components/LineWithPoint.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="containerLine" class="line-chart"></div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'

@Component({
  name: 'LineChart',
  components: {}
})
export default class extends Vue {
  @Prop({ default: {} }) private lineData?: any

  private chart: any = null

  private currentChart: any = null

  private drawData: any = {}

  private lineColor: any = {
    total: '#1890ff',
    demand: '#2fc25b'
  }

  private kindToChartAxis = {
    device: {
      total: '总设备数',
      demand: '按需计费设备数'
    },
    bandwidth: {
      upload_bandwidth: {
        total: '总用量',
        demand: '按需用量'
      },
      download_bandwidth: {
        total: '总用量',
        demand: '按需用量'
      },
      upload_traffic: {
        total: '总用量',
        demand: '按需用量'
      },
      download_traffic: {
        total: '总用量',
        demand: '按需用量'
      }
    },
    storage: {
      video: {
        total: '总用量',
        demand: '按需用量'
      },
      viid: {
        total: '总用量',
        demand: '按需用量'
      }
    },
    service: {
      'AI-100': {
        total: '总用量',
        demand: '按需用量'
      },
      'AI-200': {
        total: '总用量',
        demand: '按需用量'
      },
      'AI-300': {
        total: '总用量',
        demand: '按需用量'
      }
    }
  }

  @Watch('lineData', { deep: true, immediate: true })
  private onLineDataChange(val) {
    if (!val) return
    this.$nextTick(() => {
      this.formatterData()
    })
  }

  private formatterData() {
    const { chartKind } = this.lineData
    if (chartKind === 'device') {
      const { demandData, totalData, currentPeriod } = this.lineData
      this.drawData = {
        total: this.kindToChartAxis[chartKind].total,
        demand: this.kindToChartAxis[chartKind].demand,
        data: [...demandData, ...totalData],
        currentPeriod
      }
    } else {
      const { selection, demandData, totalData, currentPeriod } = this.lineData
      this.drawData = {
        total: this.kindToChartAxis[chartKind][selection].total,
        demand: this.kindToChartAxis[chartKind][selection].demand,
        data: [...demandData, ...totalData],
        currentPeriod
      }
    }

    this.drawLine()
  }

  private drawLine() {
    const { chartKind } = this.lineData
    const { currentPeriod } = this.lineData
    // 使chart图表重新渲染，changeData不更新legend
    this.currentChart && this.currentChart.destroy()

    this.chart = new Chart({
      container: 'containerLine',
      autoFit: true,
      width: 760,
      height: 500,
      padding: [30, 50, 50, 80]
    })

    this.chart.data(this.drawData.data)

    const values = this.drawData.data.map((item) => item.value)


    // 获取当前数据最小值的换算情况
    const getConversion = () => {
      const minValue = Math.min(...values)
      if (chartKind === 'bandwidth') {
        if (minValue > 1024) {
          return 1024
        }
        return 1
      } else if (chartKind === 'storage') {
        if (minValue > 1024 * 1024 * 1024) {
          return 1024 * 1024 * 1024
        }
        return 1024 * 1024
      }
      return 1
    }

    const getMax = () => {
      return Math.max(...values) / getConversion()
    }

    const tickInterval = getMax() > 5 ? '' : 1

    const type = chartKind === 'device' ? { type: 'linear' } : {}

    const mask =
      currentPeriod === 'today' || currentPeriod === 'yesterday'
        ? 'HH:mm'
        : 'YYYY-MM-dd'

    // 设置X轴和Y轴的配置项
    this.chart.scale({
      time: {
        range: [0, 0.95],
        type: 'timeCat',
        nice: true,
        mask
      },
      value: {
        range: [0, 0.95],
        min: 0,
        ...type,
        nice: true,
        tickInterval,
        formatter: (val) => {
          if (chartKind === 'bandwidth' || chartKind === 'storage') {
            return (val / getConversion()).toFixed(3)
          }
          return val
        }
      }
    })

    // 绘制X轴和Y轴
    this.chart.axis('time', {
      label: {
        autoRotate: true,
        offset: 14
      },
      grid: null
    })

    this.chart.axis('value', {
      label: {
        autoRotate: true,
        offset: 20,
        formatter: (val) => {
          return Math.trunc(Number(val))
        }
      }
    })

    // 绘制tooltip
    this.chart.tooltip({
      showCrosshairs: true,
      shared: true
    })

    this.chart.legend({
      offsetY: 5,
      itemSpacing: 30,
      items: [
        {
          id: 'total',
          name: this.drawData.total,
          value: 'total',
          marker: {
            symbol: 'square',
            style: {
              fill: this.lineColor.total
            },
            spacing: 5
          }
        },
        {
          id: 'demand',
          name: this.drawData.demand,
          value: 'demand',
          marker: {
            symbol: 'square',
            style: {
              fill: this.lineColor.demand
            },
            spacing: 5
          }
        }
      ],
      itemName: {
        style: {
          // fill: '#505050'
        },
        formatter: (text: any, item: any) => item.name
      }
    })

    // 绘制折线图
    this.chart
      .line()
      .position('time*value')
      .color('type', [this.lineColor.demand, this.lineColor.total])

    this.chart.render()

    this.currentChart = this.chart
  }
}
</script>
