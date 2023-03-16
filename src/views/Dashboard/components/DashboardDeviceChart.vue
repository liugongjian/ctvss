<template>
  <div v-loading="loading">
    <el-radio-group v-model="deviceTimeRange" size="small" @change="flowTimeRangeChange">
      <el-radio-button v-for="(time, key) in timeList" :key="key" :label="time.label" />
    </el-radio-group>
    <div id="device-container" :style="`height:${height}vh`" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import DashboardMixin from '../mixin/DashboardMixin'
import DashboardContainer from './DashboardContainer.vue'
import { getDeviceData, getDeviceTotal, getBandwidthHistory } from '@/api/dashboard'

@Component({
  name: 'DashboardDeviceChart',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  @Prop({ default: false })
  private isLight?: boolean

  @Prop({ default: 'device' }) private chartName?: string

  private deviceTimeRange = '近7天'
  private loading = false

  private timeList: Array<{ label: string; value: number }> = [
    {
      label: '近7天',
      value: 7 * 24 * 3600 * 1000
    },
    {
      label: '近30天',
      value: 30 * 24 * 3600 * 1000
    }
  ]

  private deviceData: any = []
  private userType = 7 * 24 * 3600 * 1000
  private chart: any = null
  public intervalTime = 60 * 1000

  private bandWidthData: any = []

  private mounted() {
    this.timeChange()
  }

  private timeChange() {
    this.destroy()
    this.setInterval(() => {
      if (this.chartName === 'device') {
        this.getData()
      } else {
        this.getbandWidth()
      }
    })
  }

  private flowTimeRangeChange(label: string) {
    this.userType = this.timeList.filter((item: any) => {
      return item.label === label
    })[0].value
    this.timeChange()
  }

  /**
   * 获取数据
   */
  private async getData() {
    try {
      const end: any = new Date()
      const start: any = new Date(end - this.userType)
      this.loading = true
      const res = await getDeviceData({
        startTime: start.getTime(),
        endTime: end.getTime()
      })
      const resTotal = await getDeviceTotal({
        startTime: start.getTime(),
        endTime: end.getTime()
      })
      this.loading = false
      const deviceData = []
      for (const key in res.deviceStatistic) {
        const item = res.deviceStatistic[key]
        const itemTotal = resTotal.deviceStatistic[key]
        deviceData.push(
          {
            time: key,
            type: '设备总数',
            value: itemTotal
          },
          {
            time: key,
            type: '新增设备数',
            value: item
          }
        )
      }
      this.deviceData = deviceData
      this.chart ? this.updateChart() : this.drawChart()
    } catch (e) {
      // 异常处理
      console.log(e)
    }
  }

  /**
   * 自适应获取图标y轴刻度
   */
  private getTickInterval(tickCount: number, scale: any): Array<number> {
    const maxValue = Math.max(...scale.values)
    const vnum = maxValue % tickCount
    let interval = (maxValue - vnum) / tickCount
    if (interval < 1) {
      interval = 1
    }
    if (vnum > interval) {
      return this.getTickInterval(tickCount - 1, scale)
    }
    const intervalArr = []
    for (let i = 1; i <= tickCount; i++) {
      if (interval * i > maxValue) break
      intervalArr.push(interval * i)
    }
    return intervalArr
  }

  /**
   * 更新图表
   */
  private async drawChart() {
    this.chart = new Chart({
      container: 'device-container',
      autoFit: true,
      padding: [20, 30, 45, 70]
    })
    this.chart.data(this.deviceData)
    this.chart.scale('value', {
      alias: '设备接入数量',
      formatter: (val: any) => {
        return val + '台'
      },
      range: [0, 1],
      tickMethod: (scale: any) => {
        return this.getTickInterval(5, scale)
      }
    })
    this.chart.axis('value', {
      label: {
        style: {
          fill: '#333',
          fontSize: 12
        }
      },
      title: {
        offset: 60
      },
      grid: {
        line: {
          style: {
            stroke: '#eee'
          }
        }
      }
    })
    this.chart.axis('time', {
      label: {
        style: {
          fill: '#333',
          fontSize: 12
        }
      }
    })
    this.chart.tooltip({
      triggerOn: 'mousemove',
      shared: true
    })
    this.chart.legend({
      offsetY: 5,
      itemSpacing: 30,
      items: [
        {
          id: '1',
          name: '设备总数',
          value: 'TotalDevices',
          marker: {
            symbol: 'square',
            style: {
              fill: '#6780B2'
            },
            spacing: 5
          }
        },
        {
          id: '2',
          name: '新增设备数',
          value: 'NewDevices',
          marker: {
            symbol: 'square',
            style: {
              fill: '#E4BC00'
            },
            spacing: 5
          }
        }
      ],
      itemName: {
        style: {
          fill: '#505050'
          // fontSize: 14
        },
        formatter: (text: any, item: any) => item.name
      }
    })
    this.chart.line().position('time*value').color('type', ['#6780B2', '#E4BC00'])
    this.chart.render()
  }

  /**
   * 更新图表
   */
  private updateChart() {
    this.chart.changeData(this.deviceData)
  }

  private async getbandWidth() {
    try {
      const end: any = new Date()
      const start: any = new Date(end - this.userType)
      this.loading = true
      const res = await getBandwidthHistory({
        startTime: start.getTime(),
        endTime: end.getTime()
      })

      const result = []

      // 后台返回数据 两个都可能为空 所以补救一下
      const upBandwidthKeys = Object.keys(res.upBandwidthHistory)
      const downBandwidthKeys = Object.keys(res.downBandwidthHistory)

      const finalData = upBandwidthKeys.length > downBandwidthKeys.length ? res.upBandwidthHistory : res.downBandwidthHistory

      for (const key in finalData) {
        const upData = res.upBandwidthHistory[key]
        const downData = res.downBandwidthHistory[key]
        result.push(
          {
            time: key,
            type: '上行带宽峰值',
            value: upData || 0
          },
          {
            time: key,
            type: '下行带宽峰值',
            value: downData || 0
          }
        )
      }

      this.bandWidthData = result
      this.chart ? this.chart.changeData(this.bandWidthData) : this.drawBandWidth()
    } catch (error) {
      this.$message.error(error && error.message)
    } finally {
      this.loading = false
    }
  }

  // 带宽图表
  private drawBandWidth() {
    this.chart = new Chart({
      container: 'device-container',
      autoFit: true,
      padding: [20, 30, 45, 70]
    })
    this.chart.data(this.bandWidthData)
    this.chart.scale('value', {
      alias: '带宽峰值（Mbps）',
      // formatter: (val: any) => {
      //   return val + 'Mbps'
      // },
      range: [0, 1],
      tickMethod: (scale: any) => {
        return this.getTickInterval(5, scale)
      }
    })
    this.chart.axis('value', {
      label: {
        style: {
          fill: '#333',
          fontSize: 12
        }
      },
      title: {
        offset: 60
      },
      grid: {
        line: {
          style: {
            stroke: '#eee'
          }
        }
      }
    })
    this.chart.axis('time', {
      label: {
        style: {
          fill: '#333',
          fontSize: 12
        }
      }
    })
    this.chart.tooltip({
      triggerOn: 'mousemove',
      shared: true
    })
    this.chart.legend({
      offsetY: 5,
      itemSpacing: 30,
      items: [
        {
          id: '1',
          name: '上行带宽峰值',
          value: 'upBandwidthHistory',
          marker: {
            symbol: 'square',
            style: {
              fill: '#6780B2'
            },
            spacing: 5
          }
        },
        {
          id: '2',
          name: '下行带宽峰值',
          value: 'downBandwidthHistory',
          marker: {
            symbol: 'square',
            style: {
              fill: '#E4BC00'
            },
            spacing: 5
          }
        }
      ],
      itemName: {
        style: {
          fill: '#505050'
          // fontSize: 14
        },
        formatter: (text: any, item: any) => item.name
      }
    })
    this.chart.line().position('time*value').color('type', ['#6780B2', '#E4BC00'])
    this.chart.render()
  }
}
</script>
