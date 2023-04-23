<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-17 10:59:01
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-04-23 10:16:39
 * @FilePath: /vss-user-web/src/views/DosageStatistics/components/LineWithPoint.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="containerLine" class="line-chart"></div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import { dateFormat, getNextHour } from '@/utils/date'

@Component({
  name: 'LineChart',
  components: {}
})
export default class extends Vue {
  @Prop({ default: {} }) private lineData?: any

  private chart: any = null

  private currentChart: any = null

  private drawData: any = {}

  private chartNoDemand = false

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

      this.chartNoDemand = demandData.length === 0

      if (this.chartNoDemand) {
        this.drawData = {
          total: this.kindToChartAxis[chartKind].total,
          data: [...demandData, ...totalData],
          currentPeriod
        }
      } else {
        this.drawData = {
          total: this.kindToChartAxis[chartKind].total,
          demand: this.kindToChartAxis[chartKind].demand,
          data: [...demandData, ...totalData],
          currentPeriod
        }
      }
    } else {
      const { selection, demandData, totalData, currentPeriod } = this.lineData

      this.chartNoDemand = demandData.length === 0
      // this.chartNoDemand = true

      if (this.chartNoDemand) {
        this.drawData = {
          total: this.kindToChartAxis[chartKind][selection].total,
          data: [...totalData],
          currentPeriod
        }
      } else {
        this.drawData = {
          total: this.kindToChartAxis[chartKind][selection].total,
          demand: this.kindToChartAxis[chartKind][selection].demand,
          data: [...demandData, ...totalData],
          currentPeriod
        }
      }
    }

    this.drawLine()
  }

  private drawLine() {
    const { chartKind, selection } = this.lineData
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

    const tickIntervalInfo = () => {
      if (getMax() > 5) {
        return {
          // tickInterval: 5
        }
      } else {
        return {
          tickCount: 1,
          tickMethod: 'd3-linear'
        }
      }
    }

    // const tickInterval = getMax() > 5 ? '' : 1
    const tickInterval = tickIntervalInfo()

    const type = chartKind === 'device' ? { type: 'linear' } : {}

    const getTickIntervaltime = () => {
      switch (currentPeriod) {
        case 'today':
          const times = this.drawData.data.map((item) => item.time)
          const maxTime = Math.max(...times)
          if (new Date(maxTime).getHours() > 12) {
            return {
              tickInterval: 24
            }
          }
          return {
            tickInterval: 12
          }
        case 'yesterday':
          return {
            tickInterval: 24
          }
        default:
          return {}
      }
    }

    const tickIntervalTime = getTickIntervaltime()

    const mask =
      currentPeriod === 'today' || currentPeriod === 'yesterday'
        ? 'HH:mm'
        : 'YYYY-MM-DD'

    // 设置X轴和Y轴的配置项
    this.chart.scale({
      time: {
        range: [0, 0.95],
        type: 'timeCat',
        nice: true,
        mask,
        ...tickIntervalTime,
      },
      value: {
        range: [0, 0.95],
        min: 0,
        ...type,
        nice: true,
        ...tickInterval,
        formatter: (val) => {
          if (chartKind === 'bandwidth' || chartKind === 'storage') {
            return this.fixNumber(val / getConversion(), 3)
          }
          return val
        }
      }
    })

    // 绘制X轴和Y轴
    this.chart.axis('time', {
      label: {
        autoRotate: true,
        offset: 14,
      },
      grid: null
    })

    this.chart.axis('value', {
      label: {
        autoRotate: true,
        offset: 20,
        formatter: (val) => {
          if (val > 1) {
            return Math.trunc(Number(val))
          } else {
            return this.fixNumber(val, 3)
          }
        }
      }
    })

    // 绘制tooltip
    this.chart.tooltip({
      showCrosshairs: true,
      shared: true,
      customItems: (items) => {
        let unit = ''
        const content = items.map((item) => {
          if (chartKind === 'bandwidth') {
            if (selection.endsWith('bandwidth')) {
              unit = getConversion() === 1024 ? 'Gbps' : 'Mbps'
            } else {
              unit = getConversion() === 1024 ? 'GB' : 'MB'
            }
          } else if (chartKind === 'storage') {
            unit = getConversion() === 1024 * 1024 * 1024 ? 'GB' : 'MB'
          } else {
            unit = '路'
          }

          return {
            ...item,
            value: `${item.value}${unit}`
          }
        })
        return content
      }
    })

    const getItems = () => {
      if (this.chartNoDemand) {
        return [
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
          }
        ]
      }
      return [
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
      ]
    }

    this.chart.legend({
      offsetY: 5,
      itemSpacing: 30,
      items: getItems(),
      itemName: {
        style: {
          // fill: '#505050'
        },
        formatter: (text: any, item: any) => item.name
      }
    })

    const colorList = this.chartNoDemand
      ? [this.lineColor.total]
      : [this.lineColor.demand, this.lineColor.total]

    // 绘制折线图
    this.chart.line().position('time*value').color('type', colorList)

    this.chart.render()

    this.currentChart = this.chart
  }

  // 格式化数字，替代toFixed。 输入 (3,3)返回3  不会返回3.000
  private fixNumber(value, len) {
    return Math.round(value * Math.pow(10, len)) / Math.pow(10, len)
  }
}
</script>
