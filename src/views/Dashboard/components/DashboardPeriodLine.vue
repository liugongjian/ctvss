<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-24 10:08:38
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-24 16:46:30
 * @FilePath: /vss-user-web/src/views/Dashboard/components/DashboardPeriodLine.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="dashboard-wrap-overview__item">
    <el-card>
      <el-radio-group
        v-model="currentPeriod"
        size="mini"
        class="dashboard-wrap-overview__item_period_radio"
        @input="(val) => periodChange('', val)"
      >
        <el-radio-button
          v-for="item in periods"
          :key="item.value"
          :label="item.value"
        >
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>

      <el-dropdown size="mini" @command="(val) => periodChange('service', val)">
        <el-button plain size="mini">
          AI服务<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="item in serviceOption"
            :key="item.value"
            :command="item.value"
          >
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div>
        <line-point
          v-if="Object.keys(lineData).length > 0"
          :key="chartKind"
          :chart-kind="chartKind"
          :line-data="lineData"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import LinePoint from '@/views/DosageStatistics/components/LineWithPoint.vue'
import { Options, KindToText } from '@/dics/periodLine'
import {
  getDeviceHistoryStatistics,
  getAIHistoryStatistics,
  getStorageHistoryStatistics
} from '@/api/dosageStatistics'

import { format } from 'date-fns'

@Component({
  name: 'PeriodLine',
  components: {
    LinePoint
  }
})
export default class extends Vue {
  private kindToText = KindToText
  private periods: any = []

  private currentPeriod = 'device'

  private deviceOption = {
    value: 'device',
    label: '设备'
  }

  private chartKind = 'device'

  private serviceOption: any = []

  private lineData = {}

  private param = {
    startTime: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
    endTime: new Date().getTime()
  }

  mounted() {
    this.initDraw()
    this.getData()
  }

  private async getData() {
    await this[this.kindToText[this.chartKind]['func']]()
  }

  private initDraw() {
    const { bandwidth, storage, service } = Options
    const device = {
      value: 'device',
      label: '设备',
      kind: 'device'
    }
    this.periods = [device, ...bandwidth, ...storage]
    this.serviceOption = [...service]
  }

  private periodChange(period: string, selection?: string) {
    if (!period) {
      const per = this.periods.find((item) => item.value === selection)
      this.chartKind = per.kind
    }

    this.selection = selection
    if (period === 'service') {
      this.currentPeriod = ''
      this.chartKind = 'service'
    }

    this.getData()
  }

  private async getDeviceData() {
    try {
      const { startTime, endTime } = this.param
      const param = {
        startTime: format(startTime, 'yyyy-MM-dd'),
        endTime: format(endTime, 'yyyy-MM-dd')
      }
      const res = await getDeviceHistoryStatistics(param)

      const { deviceSamples } = res

      const [demand, total] = deviceSamples

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
        currentPeriod: 'today',
        chartKind: this.chartKind,
        selection: this.selection,
        demandData,
        totalData,
        ...res
      }

    } catch (error) {
      this.$message.error(error && error.message)
    }
  }

  private async getBandwidthData() {
    console.log('getBandwidthData')
  }

   private async getStorageData() {
    console.log('getStorageData')
    try {
      this.ifLoading = true
      const { startTime, endTime } = this.param
      const param = {
        type: this.selection,
        startTime: format(startTime, 'yyyy-MM-dd'),
        endTime: format(endTime, 'yyyy-MM-dd')
      }

      const res = await getStorageHistoryStatistics(param)
      console.log('res---->', res)
      const { storageSamples } = res

      const [demand, total] = storageSamples

      const { samples: demandSamples } = demand
      const { samples: totalSamples } = total

      const totalData = totalSamples.map((item: any) => {
        const time = new Date(item.timestamp * 1000)
        return {
          time,
          type: '存储用量详情',
          ...item
        }
      })

      const demandData = demandSamples.map((item: any) => {
        const time = new Date(item.timestamp * 1000)
        return {
          time,
          type: '今日存储用量',
          ...item
        }
      })

      this.lineData = {
        currentPeriod: 'today',
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
    console.log('getServiceData')
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
      
      const demandData = Object.keys(aIDemandStatistic)?.map((item) => ({
        time: item,
        type: '使用量',
        value: aIDemandStatistic[item]
      }))

      const totalData = Object.keys(aITotalStatistic)?.map((item) => ({
        time: item,
        type: '总用量',
        value: aIDemandStatistic[item]
      }))

      this.lineData = {
        currentPeriod: 'today',
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
