<template>
  <el-date-picker
    v-if="showDatepicker"
    v-model="date"
    type="date"
    value-format="timestamp"
    placeholder="选择日期"
    size="small"
    :picker-options="pickerOptions"
    @change="changeDate"
  />
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { prefixZero } from '@/utils/date'
import { Screen } from '@/views/device/models/Screen/Screen'

@Component({
  name: 'Datepicker'
})
export default class extends Vue {
  @Prop()
  private screen: Screen

  private date: number = null
  private showDatepicker = true

  private get recordManager() {
    return this.screen && this.screen.recordManager
  }

  private get recordStatistic() {
    return this.screen && this.screen.recordManager.recordStatistic
  }

  private get currentDate() {
    return this.screen && this.screen.currentDate * 1000
  }

  @Watch('screen')
  @Watch('screen.recordType')
  private onChange() {
    this.showDatepicker = false
    this.$nextTick(() => {
      this.showDatepicker = true
    })
  }

  @Watch('currentDate', {
    immediate: true
  })
  private onCurrentDateChange() {
    this.date = this.currentDate
  }

  private pickerOptions = {
    disabledDate(time: any) {
      return time.getTime() > Date.now()
    },
    cellClassName: (date: any) => {
      if (!this.recordManager) return
      const monthStr = `${date.getFullYear()}-${prefixZero(date.getMonth() + 1, 2)}`
      const dateStr = monthStr + `-${prefixZero(date.getDate(), 2)}`
      const month = this.recordStatistic.get(monthStr)
      const hasRecords = month ? month.has(dateStr) : ''
      return hasRecords ? 'has-records' : ''
    },
    changeCalendar: (date: any) => {
      if (!this.recordManager) return
      const monthStr = `${date.getFullYear()}-${date.getMonth()}`
      if (!this.recordStatistic.has(monthStr)) {
        const startTime = Math.floor(new Date(date.getFullYear(), date.getMonth() - 1).getTime() / 1000)
        const endTime = Math.floor(new Date(date.getFullYear(), date.getMonth() + 1).getTime() / 1000)
        this.recordManager.getRecordStatistic(startTime, endTime)
      }
    }
  }

  /**
   * 切换日期
   */
  private changeDate(date: number) {
    console.log(date)
    this.screen.getRecordListByDate(date / 1000)
  }
}

</script>
