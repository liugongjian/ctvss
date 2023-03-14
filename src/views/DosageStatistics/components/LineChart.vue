<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-02 14:17:04
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-13 17:56:54
 * @FilePath: /vss-user-web/src/views/DosageStatistics/components/lineChart.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="containerLine" class="line-chart"></div>
</template>

<script lang="ts">
import {
  Vue,
  Prop,
  Component,
  Watch
} from 'vue-property-decorator'
import { Chart } from '@antv/g2'

@Component({
  name: 'LineChart',
  components: {}
})
export default class extends Vue {

  @Prop() private chartTitle!: string

  private chartData = [
    {
      date: '2023-01-23',
      total: 110,
      use: 10
    },
    {
      date: '2023-01-24',
      total: 19,
      use: 12
    },
    {
      date: '2023-01-25',
      total: 17,
      use: 17
    },
    {
      date: '2023-01-27',
      total: 6,
      use: 3
    },
    {
      date: '2023-01-28',
      total: 21,
      use: 7
    }
  ]

  private chart: any = null

  private currentChart: any = null

  private lineColor: any = {
    total: '#1890ff',
    use: '#2fc25b'
  }

  mounted() {
    this.drawLine()
  }

  @Watch('chartTitle', { immediate: false })
  private onChartTitleChange(){
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

    this.chart.data(this.chartData)

    this.chart.scale({
      use: {
        range: [0.05, 0.95],
        min: 0,
        max: 100,
        sync: true,
        nice: true,
        type: 'log'
      },
      total: {
        range: [0.05, 0.95],
        min: 0,
        max: 100,
        sync: true,
        nice: true,
        type: 'log'
      },
      date: {
        // 图表距离周边距离
        range: [0.05, 0.95]
      }
    })

    this.chart.axis('use', false)

    this.chart.axis('date', {
      label: {
        rotate: this.chartData.length / 3 > 10 ? -45 : 0,
        //x轴日期根据数据量判断是否逆时针旋转一定角度，需设置autoRotate:false逆时针才会生效
        autoRotate: false,
        offset: 30, //文本偏移量，避免旋转后，文本与x轴重叠
        autoHide: false, //是否隐藏部分
        autoEllipsis: false //是否省略
      }
    })

    this.chart.legend({
      custom: true,
      items: [
        {
          name: 'total',
          // value: 'total',
          marker: {
            symbol: 'hyphen',
            style: {
              stroke: this.lineColor.total,
              lineWidth: 2
            }
          }
        },
        {
          name: 'use',
          // value: 'use',
          marker: {
            symbol: 'hyphen',
            style: {
              stroke: this.lineColor.use,
              lineWidth: 2
            }
          }
        }
      ]
    })

    this.chart
      .line()
      .position('date*total')
      .color(this.lineColor.total)
      .tooltip('date*total*use')

    this.chart
      .line()
      .position('date*use')
      .color(this.lineColor.use)
      .tooltip('date*use')

    this.chart.tooltip({
      // showCrosshairs: true, // 展示 Tooltip 辅助线
      // shared: true,
      containerTpl: `
        <div class="g2-tooltip">
          <div class="g2-tooltip-title"></div>
          <ul class="g2-tooltip-list"></ul>
        </div>`,
      itemTpl: `
          <li class="g2-tooltip-list-item item-{name}">
            <span class="g2-tooltip-marker" ></span>
            <span class="g2-tooltip-name">{name}</span>:<span class="g2-tooltip-value">{value}</span>
          </li>`
    })

    this.chart
      .point()
      .position('date*total')
      .color('total', () => {
        return this.lineColor.total
      })
      .shape('circle')
      .style({ stroke: '#fff', lineWidth: 1 })
      .tooltip('date*total*use')

    this.chart
      .point()
      .position('date*use')
      .color(this.lineColor.use)
      .shape('circle')
      .style({ stroke: '#fff', lineWidth: 1 })
      .tooltip('date*use')

    // this.chart.removeInteraction('tooltip')
    // this.chart.removeInteraction('legend-filter')
    // this.chart.interaction('legend-visible-filter')

    this.chart.interaction('element-highlight')

    this.chart.interaction('active-region')

    // legend 图例的点击事件 因为line自定义而不起作用，所以，曲线救国
    this.chart.on('legend-item:click', (ev: any) => {
      const item = ev?.target?.get('delegateObject').item
      const id = item?.id

      // 使用find 默认返回第一个，也就是line，实际上有两个值 一个是line 一个是point
      const graph = this.chart.geometries.filter(
        (w) => w.getAttribute('position').getFields()[1] === id
      )
      if (graph) {
        graph.forEach((ele) => {
          ele.changeVisible(!item.unchecked)
        })
      }
    })

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
