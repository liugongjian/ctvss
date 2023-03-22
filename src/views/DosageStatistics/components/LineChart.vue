<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-02 14:17:04
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-21 17:03:17
 * @FilePath: /vss-user-web/src/views/DosageStatistics/components/lineChart.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="containerLine" class="line-chart"></div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'

@Component({
  name: 'LineChart',
  components: {}
})
export default class extends Vue {
  @Prop() private chartTitle!: string



  private chart: any = null

  private currentChart: any = null

  private lineColor: any = {
    total: '#1890ff',
    demand: '#2fc25b'
  }

  mounted() {
    this.drawLine()
  }

  @Watch('chartTitle', { immediate: false })
  private onChartTitleChange() {
    this.drawLine()
  }

  private drawLine() {
    this.currentChart && this.currentChart.destroy()

    this.chart = new Chart({
      container: 'containerLine',
      autoFit: true,
      height: 500,
      padding: [30, 20, 70, 30]
    })

     const res = {
      code: 0,
      message: '',
      requestId: 'b710e1f689924f71bf5dfcebd33c35c0',
      data: {
        requestId: '20e9acb9ac0345c495d4997ab0ba067e',
        deviceSamples: [
          {
            type: 'on-demand',
            samples: [
              {
                timestamp: '1678985700',
                value: '6'
              },
              {
                timestamp: '1679032500',
                value: '66'
              },
              {
                timestamp: '1679035800',
                value: '10'
              },
              {
                timestamp: '1679036100',
                value: '100'
              },
              {
                timestamp: '1679036100',
                value: '100'
              },
              {
                timestamp: '1679036400',
                value: '0'
              },
              {
                timestamp: '1679036700',
                value: '0'
              },
              {
                timestamp: '1679037000',
                value: '24'
              },
              {
                timestamp: '1679037300',
                value: '100'
              },
              {
                timestamp: '1679037600',
                value: '55'
              },
              {
                timestamp: '1679037900',
                value: '10'
              },
              {
                timestamp: '1679038200',
                value: '200'
              },
              {
                timestamp: '1679038500',
                value: '70'
              },
              {
                timestamp: '1679038800',
                value: '60'
              },
              {
                timestamp: '1679039100',
                value: '55'
              },
              {
                timestamp: '1679039400',
                value: '66'
              },
              {
                timestamp: '1679039700',
                value: '22'
              },
              {
                timestamp: '1679040000',
                value: '33'
              },
              {
                timestamp: '1679040300',
                value: '100'
              },
              {
                timestamp: '1679040600',
                value: '44'
              },
              {
                timestamp: '1679040900',
                value: '100'
              },
              {
                timestamp: '1679041200',
                value: '55'
              },
              {
                timestamp: '1679041500',
                value: '100'
              },
              {
                timestamp: '1679041800',
                value: '77'
              },
              {
                timestamp: '1679042100',
                value: '100'
              },
              {
                timestamp: '1679042400',
                value: '100'
              },
              {
                timestamp: '1679042700',
                value: '100'
              },
              {
                timestamp: '1679043000',
                value: '100'
              },
              {
                timestamp: '1679043300',
                value: '100'
              },
              {
                timestamp: '1679043600',
                value: '100'
              },
              {
                timestamp: '1679043900',
                value: '10'
              },
              {
                timestamp: '1679044500',
                value: '30'
              },
              {
                timestamp: '1679044800',
                value: '100'
              },
              {
                timestamp: '1679045100',
                value: '100'
              },
              {
                timestamp: '1679048100',
                value: '100'
              },
              {
                timestamp: '1679048700',
                value: '110'
              },
              {
                timestamp: '1679050800',
                value: '110'
              },
              {
                timestamp: '1679053200',
                value: '110'
              },
              {
                timestamp: '1679057100',
                value: '110'
              },
              {
                timestamp: '1679064300',
                value: '55'
              },
              {
                timestamp: '1679065500',
                value: '110'
              },
              {
                timestamp: '1679065800',
                value: '110'
              },
              {
                timestamp: '1679066100',
                value: '110'
              },
              {
                timestamp: '1679067900',
                value: '10'
              },
              {
                timestamp: '1679068200',
                value: '10'
              },
              {
                timestamp: '1679068500',
                value: '66'
              }
            ]
          },
          {
            type: 'total',
            samples: [
              {
                timestamp: '1679037300',
                value: '100'
              },
              {
                timestamp: '1679037600',
                value: '130'
              },
              {
                timestamp: '1679037900',
                value: '200'
              },
              {
                timestamp: '1679038200',
                value: '250'
              },
              {
                timestamp: '1679038500',
                value: '140'
              },
              {
                timestamp: '1679038800',
                value: '170'
              },
              {
                timestamp: '1679039100',
                value: '180'
              },
              {
                timestamp: '1679039400',
                value: '120'
              },
              {
                timestamp: '1679039700',
                value: '190'
              },
              {
                timestamp: '1679040000',
                value: '100'
              },
              {
                timestamp: '1679040300',
                value: '100'
              },
              {
                timestamp: '1679040600',
                value: '100'
              },
              {
                timestamp: '1679040900',
                value: '100'
              },
              {
                timestamp: '1679041200',
                value: '100'
              },
              {
                timestamp: '1679041500',
                value: '100'
              },
              {
                timestamp: '1679041800',
                value: '100'
              },
              {
                timestamp: '1679042100',
                value: '100'
              },
              {
                timestamp: '1679042400',
                value: '100'
              },
              {
                timestamp: '1679042700',
                value: '100'
              },
              {
                timestamp: '1679043000',
                value: '100'
              },
              {
                timestamp: '1679043300',
                value: '100'
              },
              {
                timestamp: '1679043600',
                value: '100'
              },
              {
                timestamp: '1679043900',
                value: '100'
              },
              {
                timestamp: '1679044500',
                value: '100'
              },
              {
                timestamp: '1679044800',
                value: '100'
              },
              {
                timestamp: '1679045100',
                value: '100'
              },
              {
                timestamp: '1679045400',
                value: '100'
              }
            ]
          }
        ]
      }
    }

    const {
      data: { deviceSamples }
    } = res

    const [demand, total] = deviceSamples


    const { samples: demandSamples } = demand
    const { samples: totalSamples } = total

    const demandData = demandSamples.map((item: any) => {
      const time = new Date(item.timestamp * 1000)
      return {
        time,
        type: '新增设备数',
        ...item
      }
    })

    const totalData = totalSamples.map((item: any) => {
      const time = new Date(item.timestamp * 1000)
      return {
        time,
        type: '设备总数',
        ...item
      }
    })

    const testData = [...demandData, ...totalData]
    this.chart.data(testData)

    
    // 设置X轴和Y轴的配置项
    this.chart.scale({
      time: {
        type: 'time',
        range: [0.05, 0.95]
      },
      value: {
        type: 'linear',
        range: [0.05, 0.95],
        min: 0,
        nice: true
      }
    })

   

    // 绘制X轴和Y轴
    this.chart.axis('time', {
      label: {
        autoRotate: false,
        offset: 14
      },
      grid: null
    })
    
    this.chart.axis('value', {
      title: {
        offset: 40,
        text: '设备接入数量',
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
          name: '设备总数',
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
          name: '新增设备数',
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
          fill: '#505050'
        },
        formatter: (text: any, item: any) => item.name
      }
    })

     // 绘制折线图
    this.chart.line().position('time*value').color('type', [this.lineColor.total, this.lineColor.demand])

    this.chart.render()

    this.currentChart = this.chart
  }
}
</script>
<style lang="scss" scoped>
.line-chart {
  ::v-deep .g2-tooltip {
    .item-date {
      display: none;
    }

    .item-total {
      .g2-tooltip-marker {
        background-color: #1890ff;
      }
    }

    .item-use {
      .g2-tooltip-marker {
        background-color: #2fc25b;
      }
    }
  }
}
</style>
