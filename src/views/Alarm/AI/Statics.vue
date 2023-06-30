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
            <div class="alarm-stats__list__item--1">{{ item.algoName }}</div>
            <div class="alarm-stats__list__item--2">{{ item.number }}</div>
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
            <el-select v-model="algoType" multiple placeholder="请选择" size="mini" @change="handleChangeSelect">
              <el-option
                v-for="item in algoTypes"
                :key="item.algoCode"
                :label="item.algoName"
                :value="item.algoCode"
              >
              </el-option>
            </el-select>
            <el-radio-group v-model="period" size="mini" @change="handleChange">
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
import { Vue, Component, Watch } from 'vue-property-decorator'
import { getAiStats, getAiAlgoTypes, getAlgorithmList, configAlgoStat } from '@/api/ai-app'
import { Chart } from '@antv/g2'
import { format } from 'date-fns'


@Component({
  name: 'alarm-stats'
})
export default class extends Vue {

  private alarmCounts = [ ]
  private timer: any

  private chartData: any

  private chartDataOrigin: any

  private showButton = false

  private chart

  private algoType = []

  private algoTypes = []

  private period = '7'

  @Watch('algoType', )
  private algoTypeChange(){
    if (this.chartDataOrigin){
      this.chartData = this.chartDataOrigin.filter(item => this.algoType.includes(item.algoCode))
      this.initChart()
    }
  }

  private ifShowButton(){
    const list: any = this.$refs.alarmList
    if (list && list.clientWidth && list.scrollWidth){
      this.showButton = list.clientWidth < list.scrollWidth
    } else {
      this.showButton = false
    }

  }


  private async mounted(){
    // this.getAuditTrend()
    await this.getAiAlgoTypes()
    await this.getChartData()
    await this.getTodayAlarms()
    window.addEventListener('resize', this.ifShowButton)

  }

  private async getAiAlgoTypes(){
    const res = await getAiAlgoTypes({})
    const { aiAbilityAlgorithms } = await getAlgorithmList({ abilityId: 0 })
    this.algoTypes = aiAbilityAlgorithms.map(algo => ({ algoCode: algo.code, algoName: algo.name }))
    this.algoType = res.statInfo.map(info => info.algoCode)
  }

  private async initChart(){
   this.chart && this.chart.destroy()
   this.chart = new Chart({
      container: 'stats_chart',
      autoFit: true,
      height: 500,
      width: 500
    })

    this.chart.data(this.chartData)
    this.chart.scale({
      month: {
        range: [0, 1],
      },
      temperature: {
        nice: true,
      },
    })

    this.chart.tooltip({
      showCrosshairs: true,
      shared: true,
    })

    this.chart.axis('number', {
      label: {
        formatter: (val) => {
          return val
        },
      },
    })

    this.chart
      .line()
      .position('day*number')
      .color('algoName')
      .shape('smooth')

    this.chart
      .point()
      .position('day*number')
      .color('algoName')
      .shape('circle')


    this.chart.interaction('legendFilter', true)
    this.chart.render()
  }

  private async getChartData(){
    const param = {
      algoCodes: this.algoType,
      startDay: format(this.getDateBefore(+this.period), 'yyyy-MM-dd'),
      endDay: format(new Date(), 'yyyy-MM-dd'),
    }
    const res = await getAiStats(param)
    this.chartDataOrigin = this.chartData = res.statInfo
    this.initChart()
  }

  private async getTodayAlarms(){
    const param = {
      startDay: format(new Date(), 'yyyy-MM-dd'),
      endDay: format(new Date(), 'yyyy-MM-dd'),
    }
    const res = await getAiStats(param)
    this.alarmCounts = res.statInfo
  }

  /**
   * 得到N天前的时间戳
   */
  private getDateBefore(dayCount) {
    const dd = new Date()
    dd.setDate(dd.getDate() - dayCount)
    const time = dd.setHours(0, 0, 0)
    return time
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

  private async handleChangeSelect(){
    try {
      await configAlgoStat({ algoCodes: this.algoType })
      this.$message.success('配置成功')
    } catch (e){
      this.$message.error(e)
    }
    this.getChartData()
  }

  private async handleChange(){
    this.getChartData()
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
      .el-select {
        width: 400px;
      }
      & > div {
        margin-left: 10px;
      }
    }
  }

}
</style>
