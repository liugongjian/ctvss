<template>
  <DashboardContainer ref="mainBox" title="录像完整率" class="container">
    <template v-slot:header>
      <el-select
        v-model="selectValue"
        size="small"
        popper-class="dark-select"
        @change="changeEvent"
      >
        <el-option
          v-for="item in selectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </template>
    <div v-if="selectValue === '0'" class="content">
      <div class="content__calendar">
        <el-tooltip v-for="(item, index) in data" :key="index" placement="top" effect="light">
          <div slot="content">{{ item.time }}<br/>{{ `rate: ${parseFloat(item.rate * 100).toFixed(1)}%` }}</div>
          <div class="content__calendar__item">
            <p :style="item.itemBgColor">
              <span>{{ index + 1 === data.length ? '今': item.day }}</span>
            </p>
          </div>
        </el-tooltip>
      </div>
      <div class="content__process">
        <span class="content__process__span content__process__span--top">0%</span>
        <span class="content__process__span content__process__span--bottom">100%</span>
      </div>
    </div>
    <div v-show="selectValue === '1'" id="chartContainer"></div>
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import DashboardContainer from './DashboardContainer.vue'
import { Chart } from '@antv/g2'
import { getIntegrityRate } from '@/api/dashboard'
import { dateFormatInTable } from '@/utils/date'

@Component({
  name: 'DashboardDevice',
  components: { DashboardContainer }
})
export default class extends Vue {
  private data: any = []
  private data_hours: any = []
  private selectValue: string = '0'
  private selectOptions: any = [{
    value: '0',
    label: '最近30天'
  }, {
    value: '1',
    label: '最近24小时'
  }]
  private resizeObserver: any
  private chart: any

  private changeEvent(val: string) {
    if (val === '0') {
      this.$nextTick(() => {
        this.setCalender()
      })
    } else if (val === '1') {
      this.$nextTick(() => {
        // @ts-ignore
        document.getElementById('chartContainer').innerHTML = ''
        this.setChart()
      })
    }
  }

  mounted() {
    this.setCalender()
  }
  private setCalender() {
    const time = new Date().getTime()
    var startTime = dateFormatInTable('', '', time - 3600 * 30 * 24 * 1000)
    var endTime = dateFormatInTable('', '', time)
    getIntegrityRate({
      startTime: startTime,
      endTime: endTime
    }).then((res) => {
      this.data = []
      for (let i = 0; i < 30; i++) {
        var mock_time = dateFormatInTable('', '', time - 3600 * (29 - i) * 24 * 1000)
        this.data.push({
          time: mock_time.split(' ')[0],
          rate: 0,
          day: parseInt(mock_time.split(' ')[0].split('-')[2])
        })
      }
      Object.keys(res.rate).forEach((key) => {
        var index = this.data.findIndex((item: any) => {
          return item.time === key.split(' ')[0]
        })
        this.data[index] = {
          time: key.split(' ')[0],
          rate: res.rate[key],
          day: parseInt(key.split(' ')[0].split('-')[2])
        }
      })
      // 日历
      var gradient = {
        rgb_top: [124, 201, 111],
        rgb_bottom: [226, 97, 95]
      }
      var rgb = [
        gradient.rgb_top[0] - gradient.rgb_bottom[0],
        gradient.rgb_top[1] - gradient.rgb_bottom[1],
        gradient.rgb_top[2] - gradient.rgb_bottom[2]
      ]
      for (let i = 0; i < this.data.length; i++) {
        var rgb_temp = [
          gradient.rgb_bottom[0] + rgb[0] * this.data[i].rate,
          gradient.rgb_bottom[1] + rgb[1] * this.data[i].rate,
          gradient.rgb_bottom[2] + rgb[2] * this.data[i].rate
        ]
        this.data[i].itemBgColor = `background-color: rgb(${rgb_temp[0]},${rgb_temp[1]},${rgb_temp[2]})`
      }
    })
  }

  private setChart() {
    const time = new Date().getTime()
    var startTime = dateFormatInTable('', '', time - 3600 * 23 * 1000)
    var endTime = dateFormatInTable('', '', time)
    getIntegrityRate({
      startTime: startTime,
      endTime: endTime
    }).then((res) => {
      this.data_hours = []
      Object.keys(res.rate).forEach((key) => {
        this.data_hours.push({
          time: key.split(' ')[1].slice(0, -3),
          rate: res.rate[key]
        })
      })
      // 柱状图
      var chartData = []
      for (let i = 0; i < this.data_hours.length; i++) {
        chartData.push({
          time: this.data_hours[i].time,
          value: this.data_hours[i].rate
        })
      }
      this.chart = new Chart({
        container: 'chartContainer',
        autoFit: true
      })
      this.chart.scale({
        time: {
          range: [0, 1]
        },
        value: {
          alias: 'rate',
          nice: true,
          formatter: (val: number) => {
            return (val * 100).toFixed(0) + '%'
          }
        }
      })
      this.chart.legend(false)
      this.chart.data(chartData)
      this.chart
        .interval()
        .position('time*value')
        .color('value', (val: number) => {
          var gradient = {
            rgb_top: [124, 201, 111],
            rgb_bottom: [226, 97, 95]
          }
          var rgb = [
            gradient.rgb_top[0] - gradient.rgb_bottom[0],
            gradient.rgb_top[1] - gradient.rgb_bottom[1],
            gradient.rgb_top[2] - gradient.rgb_bottom[2]
          ]
          var rgb_temp = [
            gradient.rgb_bottom[0] + rgb[0] * val,
            gradient.rgb_bottom[1] + rgb[1] * val,
            gradient.rgb_bottom[2] + rgb[2] * val
          ]
          return `rgb(${rgb_temp[0]}, ${rgb_temp[1]}, ${rgb_temp[2]})`
        })
      this.chart.axis('value', {
        grid: null
      })
      this.chart.axis('time', {
        label: {
          formatter: (val: string) => {
            return val
          }
        }
      })
      this.chart.render()
    })
  }
}
</script>
<style lang="scss" scoped>
  #chartContainer {
    width: 100%;
    height: 20vh;
  }
  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 20vh;

    &__calendar {
      display: flex;
      flex-wrap: wrap;
      width: 90%;
      height: 95%;
      margin-right: 3%;
      margin-left: -5%;

      &__item {
      display: flex;
      height: 33%;
      width: 10%;
      justify-content: center;
      align-items: center;
      p {
        font-size: 1em;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #7CC96F;
        border-radius: 100%;
        width: 2em;
        height: 2em;
        color: white;
        span {
          -webkit-user-select:none;
          -moz-user-select:none;
          -ms-user-select:none;
          user-select:none;
        }
      }
    }
    }

    &__process {
      position: relative;
      top: 20%;
      /* (226, 97, 95), (124, 201, 111) */
      background-image: linear-gradient(#E2615F, #7CC96F);
      width: 3px;
      height: 40%;
      border-radius: 10px;

      &__span {
        font-size: 0.5em;
        position: absolute;
        left: 200%;

        &--top {
          top: 0;
          color: #E2615F;
        }

        &--bottom {
          top: 90%;
          color: #7CC96F;
        }
      }
    }

  }
</style>
