<template>
  <div>
    <el-card>
      <div class="alarm-stats__title">今日AI告警</div>
      <div ref="alarmContainer" class="alarm-stats__container">
        <div v-if="showButton" class="left-arrow" @click="() => handleScroll(-1)" @mousedown="() => startScroll(-1)" @mouseup="stopScroll">
          <i class="el-icon-arrow-left" />
        </div>
        <ul ref="alarmList" class="alarm-stats__list">
          <li v-for="item in alarmCounts" :key="item.type" class="alarm-stats__list__item">
            <div class="alarm-stats__list__item--1">{{ item.count }}</div>
            <div class="alarm-stats__list__item--2">{{ item.type }}</div>
          </li>
        </ul>
        <div v-if="showButton" class="right-arrow" @click="() => handleScroll(1)" @mousedown="() => startScroll(1)" @mouseup="stopScroll">
          <i class="el-icon-arrow-right" />
        </div>
      </div>
      <div class="alarm-stats__chart">
        <div class="alarm-stats__chart--add">
          <div>AI告警统计详情（次）</div>
          <div class="alarm-stats__chart--op">
            <el-select v-model="algoType" multiple placeholder="请选择" size="mini">
              <el-option
                v-for="item in algoTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-radio-group v-model="period" size="mini">
              <el-radio-button label="7">近7天</el-radio-button>
              <el-radio-button label="30">近30天</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div id="stats_chart" />
      </div>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Chart } from '@antv/g2'


@Component({
  name: 'alarm-stats'
})
export default class extends Vue {

  // private alarmCounts = [{ count: 10, type: '口罩检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }, { count: 12, type: '人脸检测' }]
  private alarmCounts = [{ count: 10, type: '口罩检测' }, { count: 12, type: '人脸检测' }, ]
  private timer: any

  private chartData: any

  private showButton = false

  private algoType = []

  private algoTypes = [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }]

  private period = '7'

  private ifShowButton(){
    const list: any = this.$refs.alarmList
    if (list && list.clientWidth && list.scrollWidth){
      this.showButton = list.clientWidth < list.scrollWidth
    } else {
      this.showButton = false
    }

  }

  private mounted(){
    this.getChartData()
    this.ifShowButton()
  }

  private async initChart(){
   const chart = new Chart({
      container: 'stats_chart',
      autoFit: true,
      height: 500,
      width: 500
    })

    chart.data(this.chartData)
    chart.scale({
      Date: {
        tickCount: 10
      },
      Close: {
        nice: true,
      }
    })
    chart.axis('Date', {
      label: {
        formatter: text => {
          const dataStrings = text.split('.')
          return dataStrings[2] + '-' + dataStrings[1] + '-' + dataStrings[0]
        }
      }
    })

    chart.line().position('Date*Close')
    // annotation
    const { min, max } = this.findMaxMin(this.chartData)
    chart.annotation().dataMarker({
      top: true,
      position: [max.Date, max.Close],
      text: {
        content: '全部峰值：' + max.Close,
      },
      line: {
        length: 30,
      }
    })
    chart.annotation().dataMarker({
      top: true,
      position: [min.Date, min.Close],
      text: {
        content: '全部谷值：' + min.Close,
      },
      line: {
        length: 50,
      }
    })
    chart.render()

  }

  private getChartData(){
    fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/nintendo.json').then(res => res.json()).then(data => {
      this.chartData = data
      console.log('data:', data)
      this.initChart()
    })
  }

  private handleScroll(step){
    const list: any = this.$refs.alarmList
    list.scrollLeft = list.scrollLeft + step * 50
  }

  private startScroll(step){
    this.timer = setTimeout(() => {
      this.handleScroll(step)
      this.startScroll(step)
    }, 200)
  }

  private stopScroll(){
    this.timer && clearTimeout(this.timer)
  }

  private findMaxMin(data) {
    let maxValue = 0
    let minValue = 50000
    let maxObj = null
    let minObj = null
    for (const d of data) {
      if (d.Close > maxValue) {
        maxValue = d.Close
        maxObj = d
      }
      if (d.Close < minValue) {
        minValue = d.Close
        minObj = d
      }
    }
    return { max: maxObj, min: minObj }
  }

}

</script>
<style lang="scss" scoped>
.alarm-stats{
  &__title{
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  &__container {
    position: relative;
    .left-arrow,.right-arrow {
      cursor: pointer;
      & > i {
        font-size: 24px;
      }
      position:absolute;
      top: 50%;
      transform: translateY(-50%);
    }
    .left-arrow{
      left: -20px;
    }
    .right-arrow{
      right: -20px;
    }
  }
  &__list {
    overflow-x: auto;
    white-space: nowrap;
    &::-webkit-scrollbar {
      display: none;
    }
    &__item{
      display: inline-block;
      width: 140px;
      height: 80px;
      background: #f2f2f2;
      margin-right: 10px;
      & > div {
        padding: 15px 0 0 25px;
        height: 50%;
        font-size: 12px;
        width: 100%;
      }
      &--1{
        font-weight: bold;
      }
    }
  }

  &__chart{
    margin-top: 40px;
    padding: 20px;
    border: 1px solid #cac9c9;
    &--add{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    &--op {
      & > div {
        margin-left: 10px;
      }
    }
  }

}
</style>
