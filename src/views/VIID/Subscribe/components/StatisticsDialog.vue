<template>
  <el-dialog
    title="通知统计"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="700px"
    center
    class="dialog"
    @close="closeDialog"
  >
    <div v-loading="loading">
      <el-tag>总吞吐量：{{ totalNum }}</el-tag>
      <el-tag>今日吞吐量：{{ dailyNum }}</el-tag>
      <el-radio-group v-model="timeInterval" size="small" style="margin-left: 10px;" @change="timeIntervalChange">
        <el-radio-button v-for="item in timeList" :key="item.value" :label="item.label" />
      </el-radio-group>
      <div v-show="data.length > 0" id="statistic-container" />
      <div v-show="data.length === 0" class="no-data">暂无数据</div>
    </div>
  </el-dialog>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Chart } from '@antv/g2'
import { getSubscribesStat } from '@/api/viid'
import { dateFormat } from '@/utils/date'

@Component({
  name: 'StatisticsDialog'
})
export default class extends Vue {
  @Prop() private subscribeId: string

  private loading = false
  private timeInterval = '最近一小时'
  private timeList: Array<{ label: string; value: string }> = [
    {
      label: '最近一小时',
      value: 'hour'
    },
    {
      label: '最近一天',
      value: 'day'
    }
  ]
  private dialogVisible = true
  private data = []
  private totalNum = 0
  private dailyNum = 0
  private chart: any = null

  private formatTime(val) {
    if (val === 0) return '-'
    return dateFormat(new Date(val))
  }

  private closeDialog() {
    this.$emit('on-close')
  }
  private async getData() {
    const interval = this.timeList.find(item => item.label === this.timeInterval).value
    const param = {
      subscribeID: this.subscribeId,
      timeInterval: interval
    }
    try {
      this.loading = true
      const res: any = await getSubscribesStat(param)
      this.data = res.data.map(item => {
        return {
          time: this.formatTime(item.time),
          count: item.count
        }
      })
      this.totalNum = res.totalNum
      this.dailyNum = res.dailyNum
      this.$nextTick(() => {
        this.chart ? this.updateChart() : this.drawChart()
      })
    } catch (e) {
      this.$message.error(e && e.message)
    } finally {
      this.loading = false
    }
  }

  private timeIntervalChange() {
    this.getData()
  }

  private updateChart() {
    this.chart.changeData(this.data)
  }

  private async drawChart() {
    this.chart = new Chart({
      container: 'statistic-container',
      autoFit: true,
      height: 300,
      padding: [20, 30, 45, 70]
    })
    this.chart.data(this.data)
    this.chart.scale({
      time: {
        tickCount: 5,
        type: 'time',
        mask: 'YYYY-MM-DD HH:mm:ss'
      },
      count: {
        nice: true
      }
    })
    this.chart.axis('count', {
      label: {
        style: {
          fill: '#333',
          fontSize: 12
        }
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
        },
        formatter: (val: any) => {
          const datearr = val.split(' ')
          return datearr[1]
        }
      }
    })
    this.chart.tooltip({
      triggerOn: 'mousemove',
      shared: true
    })
    this.chart.line().position('time*count').shape('smooth')
    this.chart.render()
  }

  private mounted() {
    this.getData()
  }
}
</script>

<style lang="scss" scoped>
.no-data {
  height: 300px;
  line-height: 300px;
  vertical-align: middle;
  text-align: center;
  color: rgba(186, 198, 198);
}
</style>
