<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-09 15:23:42
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-16 15:20:30
 * @FilePath: /vss-user-web/src/views/DosageStatistics/components/periodLine.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="dosage-statistics__chart">
    <div class="dosage-statistics__chart_period">
      <span>{{ chartTitle }}</span>
      <el-radio-group v-model="currentPeriod" size="mini" class="dosage-statistics__chart_period_radio" @input="timeIntervalChange">
        <el-radio-button v-for="item in periods" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="dosage-statistics__chart_content">
      <line-chart :chart-title="chartTitle" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import LineChart from './LineChart.vue'
import { periods } from '@/dics/dosageStatistics'
import { getDeviceHistoryStatistics } from '@/api/dosageStatistics'


@Component({
  name: 'PeriodLine',
  components: { LineChart }
})

export default class extends Vue {

  @Prop() private chartKind!: string

  private periods = periods
  private currentPeriod = 'today'

  private kindToText: any = {
    device: {
      name: '设备接入详情',
      func: 'getDeviceData'
    },
    bandwidth: {
      name: '带宽用量详情',
      func: 'getBandwidthData'
    },
    storage: {
      name: '存储用量详情',
      func: 'getStorageData'
    },
    service: {
      name: 'AI服务用量详情',
      func: 'getServiceData'
    }
  }

  private timeDics = {
    today: 0 ,
    yesterday: 1,
    seven:7,
    month:30
  }

  private get chartTitle(){
    return this.kindToText[this.chartKind]['name']
  }

  mounted () {
    this.getData()
  }

  // private getTimeInterval(){
    
  // }

  private getData(){
    this[this.kindToText[this.chartKind]['func']]()
  } 

  private timeIntervalChange(){
    console.log('val----->', this.currentPeriod)
    const todayEarly = new Date(new Date().setHours(0,0,0,0))
    
  }

  private getDeviceData(){
    // this.getTimeInterval()
    console.log('getDeviceData')
  }

  private getBandwidthData(){
    console.log('getBandwidthData')
  }

  private getStorageData(){
    console.log('getStorageData')
  }

  private getServiceData(){
    console.log('getServiceData')
  }

}
</script>
