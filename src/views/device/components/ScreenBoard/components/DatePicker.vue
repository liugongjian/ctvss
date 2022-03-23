<template>
  <div v-if="showDatepicker" class="datepicker">
    <DatePanel
      v-if="inline"
      v-model="date"
      class="datepicker-inline"
      :picker-options="pickerOptions"
      @change="changeDate"
    />
    <el-date-picker
      v-else
      ref="datepicker"
      v-model="date"
      type="date"
      value-format="timestamp"
      placeholder="选择日期"
      size="mini"
      :clearable="false"
      :picker-options="pickerOptions"
      @change="changeDate"
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { prefixZero } from '@/utils/number'
import { Screen } from '@/views/device/models/Screen/Screen'
import DatePanel from './DatePanel.vue'

@Component({
  name: 'DatePicker',
  components: {
    DatePanel
  }
})
export default class extends Vue {
  @Prop()
  private screen: Screen

  /* 显示为内嵌模式 */
  @Prop({
    default: false
  })
  private inline

  private date: number = null
  private showDatepicker = true

  private get recordManager() {
    return this.screen && this.screen.recordManager
  }

  private get recordStatistic() {
    return this.recordManager && this.recordManager.recordStatistic
  }

  private get currentDate() {
    return this.recordManager && this.recordManager.currentDate * 1000
  }

  @Watch('screen.deviceId', { immediate: true })
  @Watch('screen.recordType')
  private async onChange() {
    if (this.recordManager) {
      this.showDatepicker = false
      const date = new Date()
      const startTime = Math.floor(new Date(date.getFullYear(), date.getMonth()).getTime() / 1000)
      const endTime = Math.floor(new Date(date.getFullYear(), date.getMonth() + 1).getTime() / 1000)
      await this.recordManager.getRecordStatistic(startTime, endTime)
      this.$nextTick(() => {
        this.showDatepicker = true
      })
    }
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
      const startTime = Math.floor(new Date(date.getFullYear(), date.getMonth() - 1).getTime() / 1000)
      const endTime = Math.floor(new Date(date.getFullYear(), date.getMonth() + 1).getTime() / 1000)
      this.recordManager.getRecordStatistic(startTime, endTime)
    }
  }

  /**
   * 切换日期
   */
  private async changeDate(date: number) {
    await this.recordManager.getRecordListByDate(date / 1000)
  }
}

</script>
<style lang="scss" scoped>
.datepicker {
  display: flex;
  align-items: center;

  ::v-deep .el-date-editor {
    width: 120px;

    .el-input__inner {
      padding-right: 0;
    }
  }

  .datepicker-inline {
    width: auto;
    min-width: 155px;
    margin: 5px 15px;
    box-shadow: none;
    border: none;
    line-height: 26px;

    ::v-deep {
      .el-picker-panel__icon-btn {
        padding: 0;
      }

      .el-date-picker__header-label {
        font-size: 14px;
      }

      .el-date-picker__header,
      .el-picker-panel__content {
        width: auto;
        margin: 0;
      }

      .el-date-table td {
        padding: 0 0 2px;
      }
    }
  }
}
</style>
