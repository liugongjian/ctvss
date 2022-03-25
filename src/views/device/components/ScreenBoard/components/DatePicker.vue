<template>
  <div class="datepicker">
    <DatePanel
      v-if="inline"
      v-model="date"
      class="datepicker-inline"
      :picker-options="pickerOptions"
      @change="changeDate"
    />
    <el-date-picker
      v-else
      v-model="date"
      type="date"
      value-format="timestamp"
      placeholder="选择日期"
      :size="size"
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

  @Prop({
    default: 'mini'
  })
  private size

  private date: number = null

  private get recordManager() {
    return this.screen && this.screen.recordManager
  }

  private get recordStatistic() {
    return this.recordManager && this.recordManager.recordStatistic
  }

  private get currentDate() {
    return this.recordManager && this.recordManager.currentDate * 1000
  }

  @Watch('currentDate', {
    immediate: true
  })
  private onCurrentDateChange() {
    this.date = this.currentDate || new Date().getTime()
  }

  private pickerOptions = {
    disabledDate(time: any) {
      return time.getTime() > Date.now()
    },
    cellClassName: (date: any) => {
      if (!this.recordManager) return
      const dateStr = `${date.getFullYear()}-${prefixZero(date.getMonth() + 1, 2)}-${prefixZero(date.getDate(), 2)}`
      return this.recordStatistic.has(dateStr) ? 'has-records' : ''
    },
    changeCalendar: (date: any) => {
      if (!this.recordManager) return
      const startTime = Math.floor(new Date(date.getFullYear(), date.getMonth() - 2).getTime() / 1000)
      const endTime = Math.floor(new Date(date.getFullYear(), date.getMonth() + 2).getTime() / 1000)
      this.recordManager.getRecordStatistic(startTime, endTime)
    }
  }

  /**
   * 切换日期
   */
  private changeDate(date: number) {
    this.$emit('change', (date / 1000))
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
