<template>
  <div :id="barChartId" class="bar-chart" />
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import * as echarts from 'echarts'

@Component({
  name: 'BarChart'
})

export default class extends Vue {
  @Prop()
  private chartData: any

  @Prop()
  private barChartId: number

  @Prop()
  private type: string

  @Prop()
  private barColor: any

  private options: any
  private seriesData: any
  private title: string
  private subtitle: string
  private unit: string

  private chartObj: any

  @Watch('chartData', { immediate: true })
  private onDataChange() {
    if (!this.chartObj) return
    this.chartObj.clear()
    this.initData()
    this.chartObj.setOption(this.options)
  }

  private created() {
    this.initData()
  }

  private mounted() {
    this.$nextTick(() => {
      const chartDom: any = document.getElementById('' + this.barChartId)
      this.chartObj = echarts.init(chartDom)
      this.options && this.chartObj.setOption(this.options)
      window.addEventListener('resize', this.resizeCharts)
      this.resizeCharts()
    })
  }

  private initData() {
    this.transData(this.chartData)
    this.options = {
      title: {
        itemGap: 15,
        text: '{a|' + this.title + '}' + '{b|' + this.unit + '}',
        subtext: '{c|' + this.subtitle + '}',
        textStyle: {
          rich: {
            a: {
              fontSize: 28,
              verticalAlign: 'bottom',
              height: 9
            },
            b: {
              fontSize: 14,
              verticalAlign: 'bottom',
              height: 1,
              fontWeight: 400,
              color: '#333333'
            }
          }
        },
        subtextStyle: {
          rich: {
            c: {
              fontSize: 14,
              verticalAlign: 'bottom',
              fontWeight: 400,
              color: '#333333'
            }
          }
        },
        left: '30%',
        top: '40%',
        textAlign: 'center'
      },
      legend: {
        top: '50%',
        left: '70%',
        orient: 'vertical',
        align: 'left'
        // fomatter: function (name) {
        //   console.log('name + data + unit', name, this.unit)
        //   return name + this.unit
        // }
      },
      tooltip: {
        show: false
      },
      series: [{
        name: this.type,
        type: 'pie',
        center: ['30%', '50%'],
        radius: ['50%', '75%'],
        avoidLabelOverlap: true,
        itemStyle: {
          color: (p) => {
            if (p.dataIndex === 0) {
              return this.barColor.mainColor
            } else {
              return this.barColor.subColor
            }
          }
        },
        label: {
          position: 'outsideFill'
        },
        labelLayout(params) {
          return {
            x: params.rect.x + params.rect.width / 2,
            dx: 100,
            y: params.rect.y,
            verticalAlign: 'middle',
            align: 'middle'
          }
        },
        data: this.seriesData
      }]
    }
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    this.resizeCharts = null
  }

  private resizeCharts() {
    if (!this.chartObj) return
    this.chartObj.resize()
  }

  private transData(chartData: any) {
    // 识别不同类型的数据
    // 硬件信息
    if (this.type === 'ram' || this.type === 'storage') {
      chartData.total = +(chartData.total).toFixed(2)
      chartData.usage = +(chartData.usage).toFixed(2)
      const unuse = +(chartData.total - chartData.usage).toFixed(2)
      this.title = chartData.total
      this.subtitle = this.type === 'ram' ? 'RAM总量' : '存储空间总量'
      this.unit = chartData.unit
      this.seriesData = [
        {
          value: chartData.usage,
          name: '已用: ' + chartData.usage + this.unit
        },
        {
          value: unuse,
          name: '未用: ' + unuse + this.unit,
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            labelLine: { show: false }
          }
        }
      ]
    } else if (this.type === 'cpu' || this.type === 'gpu') {
      const usageRate = chartData.usageRate
      const showUsageRate = (usageRate * 100).toFixed(2)

      // chartData.usageRate = +(chartData.usageRate).toFixed(2)
      // const unuse = +(1 - chartData.usageRate).toFixed(2)
      const unuse = (1 - usageRate).toFixed(2)
      // this.title = '' + chartData.usageRate * 100
      this.title = showUsageRate
      this.subtitle = this.type === 'cpu' ? 'CPU使用率' : 'GPU使用率'
      this.unit = '%'
      this.seriesData = [
        {
          // value: chartData.usageRate,
          // name: '使用率: ' + chartData.usageRate * 100 + this.unit
          value: showUsageRate,
          name: `使用率${showUsageRate}${this.unit}`
        },
        {
          value: unuse,
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            labelLine: { show: false }
          }
        }
      ]
    } else if (this.type === 'stream' || this.type === 'aiAlgo' || this.type === 'aiApp' || this.type === 'aiAlarm') {
    // } else if (this.type === 'device' || this.type === 'calculate' || this.type === 'analysis') {
      const unuse = +(chartData.total - chartData.usage).toFixed(2)
      this.title = chartData.usage
      let name1, name2
      switch (this.type + '') {
        case 'stream':
          this.unit = '路'
          this.subtitle = '视频接入'
          name1 = '总量: '
          name2 = '已接入: '
          break
        case 'aiAlgo':
          this.unit = '个'
          this.subtitle = 'AI算法'
          name1 = '上限: '
          name2 = '已部署: '
          break
        case 'aiApp':
          this.unit = '个'
          this.subtitle = '分析路数'
          name1 = '并行上限: '
          name2 = '运行中: '
          break
        case 'aiAlarm':
          this.unit = 'G'
          this.subtitle = '分析路数'
          name1 = '存储上限: '
          name2 = '已使用: '
          break
        default:
          console.log('类型判断错误')
      }
      this.seriesData = [
        {
          value: unuse,
          name: name1 + unuse + this.unit
        },
        {
          value: chartData.usage,
          name: name2 + chartData.usage + this.unit,
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            labelLine: { show: false }
          }
        }
      ]
    }
  }
}
</script>
<style lang="scss">
.bar-chart {
  margin: 0;
  padding: 0;
  width: 100%;
  min-width: 0;
  height: 100%;
  // display: inline-table;
}
</style>
