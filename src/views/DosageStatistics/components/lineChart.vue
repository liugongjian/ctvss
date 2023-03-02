<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-02 14:17:04
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-02 19:37:16
 * @FilePath: /vss-user-web/src/views/DosageStatistics/components/lineChart.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="containerLine"></div>
</template>

<script lang="ts">
import {
  Vue,
  // Prop,
  Component
} from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import { TooltipItem } from '@antv/g2/lib/interface'

@Component({
  name: 'LineChart',
  components: {}
})
export default class extends Vue {
  private chartData = [
    {
      date: '2023-01-23',
      total: 11,
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
        range: [0, 1],
        nice: true
      },
      total: {
        range: [0, 1],
        nice: true
      }
    })

    this.chart.axis('use', false)

    this.chart.legend({
      custom: true,
      items: [
        {
          name: 'total',
          value: 'total',
          maker: {
            symbol: 'line',
            style: {
              stroke: this.lineColor.total,
              lineWidth: 2
            }
          }
        },
        {
          name: 'use',
          value: 'use',
          marker: {
            symbol: 'line',
            style: {
              stroke: this.lineColor.use,
              lineWidth: 2
            }
          }
        }
      ]
    })

    this.chart.line().position('date*total').color(this.lineColor.total)
    this.chart.line().position('date*use').color(this.lineColor.use)

    this.chart.tooltip({
      // showCrosshairs: true, // 展示 Tooltip 辅助线
      // 自定义  https://g2-v4.antv.vision/zh/docs/api/general/tooltip#tooltipcfgcustomitems--items-tooltipitem--tooltipitem
      customItems: (originiItems: TooltipItem[]) => {
        const items: any = originiItems

        if (items[0].name === 'total') {
          items[1] = {
            ...items[0],
            ...{
              name: 'use',
              value: items[0].data.use,
              color: this.lineColor.use,
              mappingData: {
                color: this.lineColor.total,
                nextPoints: items[0].mappingData.nextPoints,
                points: items[0].mappingData.points,
                x: items[0].mappingData.x,
                y: items[0].mappingData.y
              }
            }
          }
        } else {
          items[0].mappingData.color = this.lineColor.use
        }
        console.log('items--0--->', items)
        return items
      },
      // itemTpl: `<div class="g2-tooltip">
      //   <div class="g2-tooltip-title">{date}</div>
      //   <ul class="g2-tooltip-list">
      //     <li class="g2-tooltip-list-item">
      //       <span class="g2-tooltip-marker"></span>
      //       <span class="g2-tooltip-name">total</span>:<span class="g2-tooltip-value">{total}</span>
      //     </li>
      //     <li class="g2-tooltip-list-item">
      //       <span class="g2-tooltip-marker"></span>
      //       <span class="g2-tooltip-name">use</span>:<span class="g2-tooltip-value">{use}</span>
      //     </li>
      //   </ul>
      // </div>`
    })

    this.chart
      .point()
      .position('date*total')
      .color('total', () => {
        return this.lineColor.total
      })
      .shape('circle')
      .style({ stroke: '#fff', lineWidth: 1 })
    this.chart
      .point()
      .position('date*use')
      .color(this.lineColor.use)
      .shape('circle')
      .style({ stroke: '#fff', lineWidth: 1 })

    // this.chart.point().position('date*total*use').tooltip({
    //   fields: ['date', 'total', 'use'],
    //   callback: (date, total, use)=>{
    //     return {
    //       date, total, use
    //     }
    //   }
    // })

    // this.chart.removeInteraction('tooltip')
    this.chart.removeInteraction('legend-filter')
    this.chart.interaction('legend-visible-filter')

    this.chart.render()

    this.currentChart = this.chart
  }
}
</script>
