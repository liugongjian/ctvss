<template>
  <DashboardContainer ref="mainBox" title="录像完整率" class="container">
    <template #header>
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
        />
      </el-select>
    </template>
    <div v-if="selectValue === '0'" class="contentIr" :style="`height:${height}vh`">
      <div class="contentIr__calendar">
        <div v-for="(item, index) in data" :key="index" class="contentIr__calendar__item">
          <el-tooltip
            placement="bottom"
            effect="light"
            popper-class="dark-tooltip"
            :visible-arrow="false"
            :open-delay="400"
          >
            <div slot="content">{{ item.time }}<br>{{ item.rate === 0 ? '无录像' : `完整率: ${parseFloat(item.rate * 100).toFixed(1)}%` }}</div>
            <p :style="item.itemBgColor">
              <span>{{ index + 1 === data.length ? '今': item.day }}</span>
            </p>
          </el-tooltip>
        </div>
      </div>
      <div class="contentIr__process">
        <span class="contentIr__process__span contentIr__process__span--top">100%</span>
        <span class="contentIr__process__span contentIr__process__span--bottom">0%</span>
      </div>
    </div>
    <div v-show="selectValue === '1'" id="chartContainer" :style="`height:${height}vh`" />
  </DashboardContainer>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import DashboardContainer from './DashboardContainer.vue'
import { Chart } from '@antv/g2'
import DashboardMixin from '../mixin/DashboardMixin'
import { dateFormatInTable } from '@/utils/date'

@Component({
  name: 'DashboardIntegrityRate',
  components: { DashboardContainer }
})
export default class extends Mixins(DashboardMixin) {
  private data: any = []
  private dataHours: any = []
  private selectValue = '0'
  private selectOptions: any = [{
    value: '0',
    label: '最近30天'
  }, {
    value: '1',
    label: '最近24小时'
  }]
  private resizeObserver: any
  private chart: any
  public intervalTime = 60 * 1000 * 10

  private changeEvent(val: string) {
    if (val === '0') {
      this.$nextTick(() => {
        this.destroy()
        this.setCalender()
      })
    } else if (val === '1') {
      this.destroy()
      this.$nextTick(() => {
        this.setChart()
      })
    }
  }

  mounted() {
    this.setCalender()
  }
  private setCalender() {
    const startTime = new Date('2020-12-29').getTime()
    const todayTime = new Date().getTime()
    this.data = []
    for (let i = 0; i < 30; i++) {
      const mockTimestamp = todayTime - 3600 * (29 - i) * 24 * 1000
      const mockTime = dateFormatInTable('', '', mockTimestamp)
      const itemBgColor = mockTimestamp > startTime ? 'background-image: linear-gradient(#16E8FF, #007FDF);color:#08233F;' : ''
      this.data.push({
        time: mockTime.split(' ')[0],
        rate: 1,
        day: parseInt(mockTime.split(' ')[0].split('-')[2]),
        itemBgColor
      })
    }

    // const time = new Date().getTime()
    // var startTime = dateFormatInTable('', '', time - 3600 * 30 * 24 * 1000)
    // var endTime = dateFormatInTable('', '', time)
    // getIntegrityRate({
    //   startTime: startTime,
    //   endTime: endTime
    // }).then((res) => {
    //   this.data = []
    //   for (let i = 0; i < 30; i++) {
    //     var mockTime = dateFormatInTable('', '', time - 3600 * (29 - i) * 24 * 1000)
    //     this.data.push({
    //       time: mockTime.split(' ')[0],
    //       rate: 0,
    //       day: parseInt(mockTime.split(' ')[0].split('-')[2])
    //     })
    //   }
    //   Object.keys(res.rate).forEach((key) => {
    //     var index = this.data.findIndex((item: any) => {
    //       return item.time === key.split(' ')[0]
    //     })
    //     this.data[index] = {
    //       time: key.split(' ')[0],
    //       rate: res.rate[key],
    //       day: parseInt(key.split(' ')[0].split('-')[2])
    //     }
    //   })
    //   // 日历
    //   var gradient = {
    //     rgb_top: [124, 201, 111],
    //     rgb_bottom: [226, 97, 95]
    //   }
    //   var rgb = [
    //     gradient.rgb_top[0] - gradient.rgb_bottom[0],
    //     gradient.rgb_top[1] - gradient.rgb_bottom[1],
    //     gradient.rgb_top[2] - gradient.rgb_bottom[2]
    //   ]
    //   for (let i = 0; i < this.data.length; i++) {
    //     var rgbTemp = [
    //       gradient.rgb_bottom[0] + rgb[0] * this.data[i].rate,
    //       gradient.rgb_bottom[1] + rgb[1] * this.data[i].rate,
    //       gradient.rgb_bottom[2] + rgb[2] * this.data[i].rate
    //     ]
    //     this.data[i].itemBgColor = `background-color: rgb(${rgbTemp[0]},${rgbTemp[1]},${rgbTemp[2]})`
    //   }
    // })
  }

  private setChart() {
    // @ts-ignore
    document.getElementById('chartContainer').innerHTML = ''
    const time = new Date()
    const startHour = time.getHours()
    for (let i = startHour - 24; i <= startHour; i++) {
      const hour = i < 0 ? 24 + i : i
      this.dataHours.push({
        time: `${hour}:00`,
        rate: 1
      })
    }
    // Object.keys(res.rate).forEach((key) => {
    //   this.dataHours.push({
    //     time: key.split(' ')[1].slice(0, -3),
    //     rate: res.rate[key]
    //   })
    // })
    // 柱状图
    const chartData = []
    for (let i = 0; i < this.dataHours.length; i++) {
      chartData.push({
        time: this.dataHours[i].time,
        value: this.dataHours[i].rate
      })
    }
    this.chart = new Chart({
      container: 'chartContainer',
      autoFit: true,
      padding: [30, 15, 30, 50]
    })
    this.chart.scale({
      time: {
        range: [0, 1]
      },
      value: {
        alias: '完整率',
        type: 'quantize',
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
      .color('time', ['l(90) 0:#65CBD2 1:#C054D1'])
    this.chart.axis('value', {
      grid: null,
      label: {
        offset: 15
      }
    })
    this.chart.axis('time', {
      label: {
        offset: 10,
        formatter: (val: string) => {
          return val
        }
      }
    })
    this.chart.render()
  }
}
</script>
<style lang="scss" scoped>
  #chartContainer {
    width: 100%;
    height: 20vh;
  }

  .contentIr {
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
      margin-top: 5%;
      margin-right: 5%;
      margin-left: -2%;

      &__item {
        display: flex;
        height: 33%;
        width: 10%;
        justify-content: center;
        align-items: center;

        p {
          font-size: 1.5vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #777;
          border-radius: 100%;
          width: 3vh;
          height: 3vh;
          color: white;

          span {
            user-select: none;
            user-select: none;
            user-select: none;
            user-select: none;
          }
        }
      }
    }

    &__process {
      position: relative;
      top: 5%;

      /* (226, 97, 95), (124, 201, 111) */
      background-image: linear-gradient(#65cbd2, #c054d1);
      width: 5px;
      height: 75%;
      border-radius: 10px;

      &__span {
        font-size: 1vh;
        position: absolute;
        left: 200%;

        &--top {
          top: -10%;
          left: -6px;
          color: #33dbe3;
        }

        &--bottom {
          bottom: -10%;
          left: -10px;
          color: #33dbe3;
        }
      }
    }
  }
</style>
