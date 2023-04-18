<!--
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-24 10:08:38
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-04-17 19:45:02
 * @FilePath: /vss-user-web/src/views/Dashboard/components/DashboardPeriodLine.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="dashboard-wrap-overview__item">
    <el-card>
      <div class="dashboard-wrap-overview__item_period_content">
        <div class="dashboard-wrap-overview__item_period_title">{{ chartTitle }}</div>
        <div class="dashboard-wrap-overview__item_period_to_detail" @click="toDosageStatistics">
          用量详情 >>
        </div>
      </div>
      <div class="dashboard-wrap-overview__item_period_detail">
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
          <el-dropdown
            size="mini"
            @command="(val) => periodChange('service', val)"
          >
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
        </el-radio-group>
      </div>
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
  getStorageHistoryStatistics,
  getBandwidthHistoryStatistics
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

  private get chartTitle() {
    return this.kindToText[this.chartKind]['name']
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
          type: '按需设备数',
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

      const [demand, total] = storageSamples

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
        type: '按需用量',
        value: aIDemandStatistic[item]
      }))

      const totalData = Object.keys(aITotalStatistic)?.map((item) => ({
        time: item,
        type: '总用量',
        value: aITotalStatistic[item]
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

  private toDosageStatistics(){
    console.log('this.chartKind--->', this.chartKind)
    this.$router.push({
      name: 'DosageStatistics',
      query: {
        tab: this.chartKind
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.dashboard-wrap-overview {
  &__item {
    ::v-deep {
      .el-radio-button--mini {
        .el-radio-button__inner {
          border-left: 1px solid #ddd;
          margin-left: -1px;
          padding: $padding-small $padding-small;
        }

        &:last-child .el-radio-button__inner {
          border-radius: 0;
        }

        .el-radio-button__orig-radio:checked + .el-radio-button__inner {
          border-left: 1px solid #fa8334;
        }
      }

      .el-dropdown {
        vertical-align: middle;
        height: 30px;
        margin-left: -1px;

        .el-button--mini {
          border-radius: 0 2px 2px 0;
          height: 30px;
        }
      }
    }

    &_period {
      &_content {
        display: flex;
        line-height: 1;
      }

      &_title {
        padding: $padding-small $padding-small;
        font-weight: 600;
        font-size: $text-size-medium;
      }

      &_detail {
        // flex: 1;
        // text-align: center;
        padding: $padding-small $padding-small;
      }

      &_to_detail {
        margin-left: auto;
        padding: $padding-small $padding-medium;
        color: $primary;
        cursor: pointer;
      }
    }
  }
}
</style>
