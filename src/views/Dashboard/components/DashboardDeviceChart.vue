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
      // const res = {
      //   upBandwidthHistory: { '2023-02-13': 7, '2023-02-14': 0, '2023-02-15': 0, '2023-02-16': 0, '2023-02-17': 0, '2023-02-18': 0, '2023-02-19': 0, '2023-02-20': 2, '2023-02-21': 0, '2023-02-22': 0, '2023-02-23': 0, '2023-02-24': 7, '2023-02-25': 0, '2023-02-26': 0, '2023-02-27': 0, '2023-02-28': 0, '2023-03-01': 0, '2023-03-02': 0, '2023-03-03': 0, '2023-03-04': 0, '2023-03-05': 0, '2023-03-06': 0, '2023-03-07': 0, '2023-03-08': 0, '2023-03-09': 0, '2023-03-10': 0, '2023-03-11': 0, '2023-03-12': 0, '2023-03-13': 0, '2023-03-14': 0 },
      //   downBandwidthHistory: { '2023-02-13': 7, '2023-02-14': 7, '2023-02-15': 7, '2023-02-16': 7, '2023-02-17': 7, '2023-02-18': 7, '2023-02-19': 7, '2023-02-20': 9, '2023-02-21': 9, '2023-02-22': 9, '2023-02-23': 9, '2023-02-24': 16, '2023-02-25': 16, '2023-02-26': 16, '2023-02-27': 16, '2023-02-28': 16, '2023-03-01': 16, '2023-03-02': 16, '2023-03-03': 16, '2023-03-04': 16, '2023-03-05': 16, '2023-03-06': 16, '2023-03-07': 16, '2023-03-08': 16, '2023-03-09': 16, '2023-03-10': 16, '2023-03-11': 16, '2023-03-12': 16, '2023-03-13': 16, '2023-03-14': 16 }
      // }

      const result = []

      for (const key in res.upBandwidthHistory) {
        const upData = res.upBandwidthHistory[key]
        const downData = res.downBandwidthHistory[key]
        result.push(
          {
            time: key,
            type: '上行带宽峰值',
            value: upData
          },
          {
            time: key,
            type: '下行带宽峰值',
            value: downData
          }
        )
      }

      this.bandWidthData = result
      this.drawBandWidth()
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
      alias: '带宽使用统计',
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
