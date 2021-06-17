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
import { getDeviceData } from '@/api/dashboard'

@Component({
  name: 'DashboardDeviceChart',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  @Prop({ default: false })
  private isLight?: boolean
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

  private mounted() {
    this.timeChange()
  }
  private timeChange() {
    this.destroy()
    this.setInterval(this.getData.bind(this))
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
      this.loading = false
      const deviceData = []
      for (let key in res.deviceStatistic) {
        const item = res.deviceStatistic[key]
        deviceData.push(
          {
            time: key,
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
      range: [0, 1]
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
    this.chart.interval().position('time*value').color('#FA8334')
    this.chart.render()
  }
  /**
   * 更新图表
   */
  private updateChart() {
    this.chart.changeData(this.deviceData)
  }
}
</script>
<style lang="scss" scoped>
</style>
