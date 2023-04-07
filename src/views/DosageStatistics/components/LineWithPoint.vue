<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-17 10:59:01
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-24 16:45:54
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
      total: '带宽用量详情',
      demand: 'getBandwidthData'
    },
    storage: {
      video: {
        total: '视频存储量详情',
        demand: '视频存储量'
      },
      viid: {
        total: '视图存储量详情',
        demand: '视图存储量'
      }
    },
    service: {
      'AI-100': {
        total: '分钟级总用量用量详情',
        demand: '分钟级用量详情'
      },
      'AI-200': {
        total: '分钟级总用量用量详情',
        demand: '秒级用量详情'
      },
      'AI-300': {
        total: '分钟级总用量用量详情',
        demand: '高算力用量详情'
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

  // mounted() {
  //   this.drawLine()
  // }

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

    this.chart ? this.chart.changeData(this.drawData.data) : this.drawLine()
    // this.drawLine()
  }

  private drawLine() {
    this.chart = new Chart({
      container: 'containerLine',
      autoFit: true,
      height: 500,
      padding: [30, 50, 50, 50]
    })

    this.chart.data(this.drawData.data)
    // 设置X轴和Y轴的配置项
    this.chart.scale({
      time: {
        range: [0.05, 0.95],
        formatter: (val) => {
          if (
            this.drawData.currentPeriod === 'today' ||
            this.drawData.currentPeriod === 'yesterday'
          ) {
            const hour = new Date(val).getHours()
            const minute = new Date(val)
              .getMinutes()
              .toString()
              .padStart(2, '0')
            return `${hour}:${minute}`
          } else {
            const year = new Date(val).getFullYear()
            const month = (new Date(val).getMonth() + 1)
              .toString()
              .padStart(2, '0')
            const day = new Date(val).getDate().toString().padStart(2, '0')
            return `${year}-${month}-${day}`
          }
        }
      },
      value: {
        type: 'linear',
        range: [0, 0.95],
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
        text: '设备接入数量'
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
  }
}
</script>
