<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-09 15:23:42
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-04-23 09:37:06
 * @FilePath: /vss-user-web/src/views/DosageStatistics/components/periodLine.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div v-loading="ifLoading" class="dosage-statistics__chart">
    <div class="dosage-statistics__chart_period">
      <span>{{ chartTitle }}</span>
      <div class="dosage-statistics__chart_period_condition">
        <el-select
          v-if="ifShowSelect"
          v-model="selection"
          size="mini"
          placeholder="请选择"
          class="dosage-statistics__chart_period_select"
          @change="getData"
        >
          <el-option
            v-for="item in options[chartKind]"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-radio-group
          v-model="currentPeriod"
          size="mini"
          class="dosage-statistics__chart_period_radio"
          @input="timeIntervalChange"
        >
          <el-radio-button
            v-for="item in periods"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="dosage-statistics__chart_content">
      <line-point
        v-if="Object.keys(lineData).length > 0"
        :key="chartKind"
        :chart-kind="chartKind"
        :line-data="lineData"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import LinePoint from './LineWithPoint.vue'
import { periods } from '@/dics/dosageStatistics'
import {
  getDeviceHistoryStatistics,
  getAIHistoryStatistics,
  getStorageHistoryStatistics,
  getBandwidthHistoryStatistics
} from '@/api/dosageStatistics'

import { Options, KindToText } from '@/dics/periodLine'
import { format } from 'date-fns'

@Component({
  name: 'PeriodLine',
  components: {
    LinePoint
  }
})
export default class extends Vue {
  @Prop() private chartKind!: string

  private periods = periods
  private options = Options
  private kindToText = KindToText
  private currentPeriod = 'today'
  private ifLoading = false

  private lineData = {}

  private selection = ''

  private unit = ''

  private param: any = {
    StartTime: 0,
    EndTime: 0
  }

  private MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

  private todayEarly = new Date(new Date().setHours(0, 0, 0, 0)).getTime()

  private timeDics = {
    today: {
      startTime: this.todayEarly,
      endTime: new Date().getTime()
    },
    yesterday: {
      startTime: this.todayEarly - this.MILLISECONDS_PER_DAY,
      endTime: this.todayEarly - 1000
    },
    seven: {
      startTime: this.todayEarly - 6 * this.MILLISECONDS_PER_DAY,
      endTime: new Date().getTime()
    },
    month: {
      startTime: this.todayEarly - 30 * this.MILLISECONDS_PER_DAY,
      endTime: new Date().getTime()
    }
  }

  private get chartTitle() {
    if ((this.chartKind === 'bandwidth' || this.chartKind === 'storage') && this.selection) {
      return `${this.kindToText[this.chartKind][this.selection]['title']}(${
        this.unit
      })`
    } else if (this.chartKind === 'service' && this.selection){
      return  `${this.kindToText[this.chartKind][this.selection]['title']}`
    }
    return this.kindToText[this.chartKind]['name']
  }

  private get ifShowSelect() {
    return this.chartKind !== 'device'
  }

  mounted() {
    this.selection =
      this.chartKind !== 'device' ? this.options[this.chartKind][0].value : ''
    this.timeIntervalChange()
  }

  private async getData() {
    await this[this.kindToText[this.chartKind]['func']]()
  }

  private async timeIntervalChange() {
    const { startTime, endTime } = this.timeDics[this.currentPeriod]

    this.param = {
      startTime: startTime,
      endTime: endTime
    }

    await this.getData()
  }

  private async getDeviceData() {
    try {
      this.ifLoading = true
      const { startTime, endTime } = this.param
      const param = {
        startTime: format(startTime, 'yyyy-MM-dd'),
        endTime: format(endTime, 'yyyy-MM-dd')
      }

      const res = await getDeviceHistoryStatistics(param)

      const { deviceSamples } = res

      // const [demand, total] = deviceSamples
      const total = deviceSamples.find((item) => item.type === 'total')
      const demand = deviceSamples.find((item) => item.type === 'on-demand')

      const { samples: demandSamples } = demand
      const { samples: totalSamples } = total

      const totalData = totalSamples.map((item: any) => {
        const time = new Date(item.timestamp * 1000)
        return {
          time,
          type: '总设备数',
          ...item
        }
      })

      const demandData = demandSamples.map((item: any) => {
        const time = new Date(item.timestamp * 1000)
        return {
          time,
          type: '按需计费设备数',
          ...item
        }
      })

      this.lineData = {
        currentPeriod: this.currentPeriod,
        chartKind: this.chartKind,
        selection: this.selection,
        demandData,
        totalData,
        ...res
      }
    } catch (error) {
      this.$message.error(error && error.message)
    } finally {
      this.ifLoading = false
    }
  }

  private async getBandwidthData() {
    try {
      this.ifLoading = true
      const { startTime, endTime } = this.param
      const param = {
        type: this.selection,
        startTime: format(startTime, 'yyyy-MM-dd'),
        endTime: format(endTime, 'yyyy-MM-dd')
      }

      const res = await getBandwidthHistoryStatistics(param)
      const { bwSamples } = res

      const total = bwSamples.find((item) => item.type === 'total')
      const demand = bwSamples.find((item) => item.type === 'on-demand')

      const { samples: demandSamples } = demand
      const { samples: totalSamples } = total

      // const title = this.selection.endsWith('bandwidth') ? '带宽' : '流量'

      const totalData = totalSamples.map((item: any) => {
        const time = new Date(item.timestamp * 1000)
        return {
          time,
          type: '总用量',
          ...item
        }
      })

      const demandData = demandSamples.map((item: any) => {
        const time = new Date(item.timestamp * 1000)
        return {
          time,
          type: '按需用量',
          ...item
        }
      })

      const getUnit = () => {
        const values = [...totalData, ...demandData].map((item) => item.value)
        const minValue = Math.min(...values)
        if (minValue > 1024) {
          if (this.selection.endsWith('bandwidth')) {
            return 'Gbps'
          } else {
            return 'GB'
          }
        } else {
          if (this.selection.endsWith('bandwidth')) {
            return 'Mbps'
          } else {
            return 'MB'
          }
        }
      }

      this.unit = getUnit()

      this.lineData = {
        currentPeriod: this.currentPeriod,
        chartKind: this.chartKind,
        selection: this.selection,
        demandData,
        totalData,
        ...res
      }
    } catch (error) {
      this.$message.error(error && error.message)
    } finally {
      this.ifLoading = false
    }
  }

  private async getStorageData() {
    try {
      this.ifLoading = true
      const { startTime, endTime } = this.param
      const param = {
        type: this.selection,
        startTime: format(startTime, 'yyyy-MM-dd'),
        endTime: format(endTime, 'yyyy-MM-dd')
      }

      const res = await getStorageHistoryStatistics(param)
      const { storageSamples } = res
      const total = storageSamples.find((item) => item.type === 'total')
      const demand = storageSamples.find((item) => item.type === 'on-demand')

      const { samples: demandSamples } = demand
      const { samples: totalSamples } = total

      const totalData = totalSamples.map((item: any) => {
        const time = new Date(item.timestamp * 1000)
        return {
          time,
          type: '总用量',
          ...item
        }
      })

      const demandData = demandSamples.map((item: any) => {
        const time = new Date(item.timestamp * 1000)
        return {
          time,
          type: '按需用量',
          ...item
        }
      })

      const getUnit = () => {
        const values = [...totalData, ...demandData].map((item) => item.value)
        const minValue = Math.min(...values)
        if (minValue > 1024 * 1024 * 1024){
          return 'GB'
        }
        return 'MB'
      }

      this.unit = getUnit()

      this.lineData = {
        currentPeriod: this.currentPeriod,
        chartKind: this.chartKind,
        selection: this.selection,
        demandData,
        totalData,
        ...res
      }
    } catch (error) {
      this.$message.error(error && error.message)
    } finally {
      this.ifLoading = false
    }
  }

  private async getServiceData() {
    try {
      this.ifLoading = true
      const { startTime, endTime } = this.param

      const param = {
        analysisType: this.selection,
        startTime: startTime.toString(),
        endTime: endTime.toString()
      }
      const res = await getAIHistoryStatistics(param)

      const { aIDemandStatistic, aITotalStatistic } = res
      // this.currentPeriod
      const demandData = Object.keys(aIDemandStatistic)?.map((item) => ({
        time: item,
        type: '按需用量',
        value: aIDemandStatistic[item]
      }))

      const totalData = Object.keys(aITotalStatistic)?.map((item) => ({
        time: item,
        type: '总用量',
        value: aITotalStatistic[item]
      }))

      this.lineData = {
        currentPeriod: this.currentPeriod,
        chartKind: this.chartKind,
        selection: this.selection,
        demandData,
        totalData,
        ...res
      }
    } catch (error) {
      this.$message.error(error && error.message)
    } finally {
      this.ifLoading = false
    }
  }
}
</script>
