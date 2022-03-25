<template>
  <div class="time-editer">
    <el-form :inline="true" class="time-editer__form">
      <el-form-item v-for="(item, index) in timeEditer" :key="index" class="time-editer__item">
        <el-input v-model="item.val" class="input__time" :placeholder="item.time" @input="editTime" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { prefixZero } from '@/utils/number'
import { Screen } from '@/views/device/models/Screen/Screen'

@Component({
  name: 'TimeEditer'
})
export default class extends Vue {
  private timeEditer = [
    { time: 'Y', val: '' },
    { time: 'M', val: '' },
    { time: 'D', val: '' },
    { time: 'H', val: '' },
    { time: 'M', val: '' },
    { time: 'S', val: '' }
  ]
  @Prop()
  private screen: Screen

  // /* 显示为内嵌模式 */
  // @Prop({
  //   default: false
  // })
  // private inline

  // @Prop({
  //   default: 'mini'
  // })
  // private size

  // private date: number = null

  private get recordManager() {
    return this.screen && this.screen.recordManager
  }

  private get recordStatistic() {
    return this.recordManager && this.recordManager.recordStatistic
  }

  private get currentDate() {
    return this.recordManager && this.recordManager.currentDate * 1000
  }
  private editTime() {
    console.log('输入时间： ', this.timeEditer)
  }

  private mounted() {
    console.log('编辑时间啊兄弟！！！！', this.recordManager)
  }

  // @Watch('currentDate', {
  //   immediate: true
  // })
  // private onCurrentDateChange() {
  //   this.date = this.currentDate
  // }

  // private pickerOptions = {
  //   disabledDate(time: any) {
  //     return time.getTime() > Date.now()
  //   },
  //   cellClassName: (date: any) => {
  //     if (!this.recordManager) return
  //     const monthStr = `${date.getFullYear()}-${prefixZero(
  //       date.getMonth() + 1,
  //       2
  //     )}`
  //     const dateStr = monthStr + `-${prefixZero(date.getDate(), 2)}`
  //     const month = this.recordStatistic.get(monthStr)
  //     const hasRecords = month ? month.has(dateStr) : ''
  //     return hasRecords ? 'has-records' : ''
  //   },
  //   changeCalendar: (date: any) => {
  //     console.log('changeCalendar', date)
  //     if (!this.recordManager) return
  //     const startTime = Math.floor(
  //       new Date(date.getFullYear(), date.getMonth() - 1).getTime() / 1000
  //     )
  //     const endTime = Math.floor(
  //       new Date(date.getFullYear(), date.getMonth() + 1).getTime() / 1000
  //     )
  //     this.recordManager.getRecordStatistic(startTime, endTime)
  //   }
  // }

  // /**
  //  * 切换日期
  //  */
  // private async changeDate(date: number) {
  //   await this.recordManager.getRecordListByDate(date / 1000)
  // }
}
</script>
<style lang="scss" scoped>

::v-deep .el-input__inner {
  position: absolute;
  top: -35px;
  width: 20px;
  height: 20px;
  padding: 0;
  border-top-width: 0px;
  border-left-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 1px;
  /*outline: medium;*/
}
.time-editer__form {
  // display: flex;
  // justify-content: start;
  margin-right: 20px;
}
.time-editer__item {
  margin-left: 20px;
}
</style>
