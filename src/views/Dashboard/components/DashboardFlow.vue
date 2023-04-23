<template>
  <div>
    <DashboardContainer v-if="!isLight" title="网络带宽统计">
      <template #header>
        <el-select
          v-model="userType"
          size="small"
          popper-class="dark-select"
          @change="timeChange"
        >
          <el-option
            v-for="time in timeList"
            :key="time"
            :label="time"
            :value="time"
          />
        </el-select>
      </template>
      <div id="flow-container" :style="`height:${height}vh`" />
    </DashboardContainer>
    <div v-else>
      <el-radio-group v-model="userType" size="small" @change="timeChange">
        <el-radio-button v-for="(time, key) in timeList" :key="key" :label="time" />
      </el-radio-group>
      <div id="flow-container" :style="`height:${height}vh`" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import { getFlowData } from '@/api/dashboard'

@Component({
  name: 'DashboardFlow',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  @Prop({ default: false })
  private isLight?: boolean
  private flowTimeRange = '今日'

  // private timeList: Array<{ label: string; value: number }> = [
  //   {
  //     label: '最近12小时',
  //     value: 12 * 60 * 60 * 1000
  //   },
  //   {
  //     label: '最近6小时',
  //     value: 6 * 60 * 60 * 1000
  //   },
  //   {
  //     label: '最近3小时',
  //     value: 3 * 60 * 60 * 1000
  //   }
  // ]
  private timeList: any = ['今日', '昨日', '近7日', '近30日']
  private flowData: any = []
  private userType: any = '今日'
  private chart: any = null
  public intervalTime = 60 * 1000

  private mounted() {
    this.timeChange()
  }
  private timeChange() {
    this.destroy()
    this.setInterval(this.getData.bind(this))
  }

  /**
   * 获取数据
   */
  private async getData() {
    let start: any
    let end: any
    const today: any = new Date().setHours(0, 0, 0, 0)
    switch (this.userType) {
      case '今日':
        end = new Date()
        start = new Date(today)
        break
      case '昨日':
        end = new Date(today)
        start = new Date(new Date(today).getTime() - 24 * 3600 * 1000)
        break
      case '近7日':
        end = new Date()
        start = new Date(end.getTime() - 7 * 24 * 3600 * 1000)
        break
      case '近30日':
        end = new Date()
        start = new Date(end.getTime() - 30 * 24 * 3600 * 1000)
        break
    }
    try {
      console.log(this.dateFormat(start), this.dateFormat(end))
      const res = await getFlowData({
        StartTime: this.dateFormat(start),
        EndTime: this.dateFormat(end)
      })
      const flowData = []
      for (const key in res.data.Bandwidth) {
        const item = res.data.Bandwidth[key]
        flowData.push(
          {
            time: key.split(' ')[1].slice(0, -3),
            type: '入网带宽',
            value: Math.floor(item['InFlow'] / 1024)
          },
          {
            time: key.split(' ')[1].slice(0, -3),
            type: '出网带宽',
            value: Math.floor(item['OutFlow'] / 1024)
          }
        )
      }
      this.flowData = flowData
      this.chart ? this.updateChart() : this.drawChart()
    } catch (e) {
      console.log(e)
      // 异常处理
    }
  }

  /**
   * 更新图表
   */
  private async drawChart() {
    this.chart = new Chart({
      container: 'flow-container',
      autoFit: true,
      padding: [20, 10, 45, 60]
    })
    this.chart.data(this.flowData)
    this.chart.scale({
      time: {
        range: [0, 1]
      },
      value: {
        nice: true
      }
    })

    this.chart.tooltip({
      showCrosshairs: true,
      shared: true,
      itemTpl: '<li data-index="{index}" style="margin: 12px 0"><span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>{name}: {value} Mbps</li>'
    })

    this.chart.legend({
      offsetY: 5,
      itemSpacing: 30,
      items: [
        {
          id: '1',
          name: '出网带宽',
          value: 'OutFlow',
          marker: {
            symbol: 'square',
            style: {
              fill: this.isLight ? '#FA8334' : '#EB155B'
            },
            spacing: 5
          }
        },
        {
          id: '2',
          name: '入网带宽',
          value: 'InFlow',
          marker: {
            symbol: 'square',
            style: {
              fill: '#0091FF'
            },
            spacing: 5
          }
        }
      ],
      itemName: {
        style: {
          fill: this.isLight ? '#505050' : '#eeeeee'
          // fontSize: 14
        },
        formatter: (text: any, item: any) => item.name
      }
    })

    this.chart.axis('value', {
      label: {
        offset: 5,
        formatter: (val: any) => {
          return val
        }
      },
      title: {
        style: {
          fill: this.isLight ? '#505050' : '#98CFFF',
          fontSize: 14
        }
      },
      grid: {
        line: {
          style: {
            stroke: this.isLight ? '#eee' : '#434659'
          }
        }
      }
    })

    this.chart.axis('time', {
      label: {
        offset: 10
      }
    })

    this.chart.scale('value', {
      alias: 'Mbps'
    })

    this.chart.line().position('time*value').color('type', this.isLight ? ['#0091FF', '#FA8334'] : ['l(0) 0:#14B7E1 1:#0091FF', 'l(0) 0:#9E10D7 1:#EB155B']).shape('smooth')

    // this.chart.point().position('time*value').color('type', ['#6F9FC9', '#F4C46C']).shape('circle')

    this.chart.render()
  }

  /**
   * 更新图表
   */
  private updateChart() {
    this.chart.changeData(this.flowData)
  }

  private dateFormat(date: any) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minites = date.getMinutes()
    const seconds = date.getSeconds()
    return [year, month, day].map(item => (item < 10 ? '0' : '') + item).join('-') + ' ' + [hours, minites, seconds].map(item => (item < 10 ? '0' : '') + item).join(':')
  }
}
</script>
<style lang="scss" scoped>
</style>
