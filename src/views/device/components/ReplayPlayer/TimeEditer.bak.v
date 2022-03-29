<template>
  <div class="time-editer">
    <el-form :inline="true" class="time-editer__form">
      <el-form-item v-for="(item, index) in timeEditer" :key="index" class="time-editer__item">
        <div :class="`address__${index === 0 ? 'wide' : 'narrow'}`">
          <el-input v-model="item.val" :placeholder="item.time" :maxlength="`${index > 0 ? 2 : 4}`" @input="editTime(index,item.val)" /><span style="position:absolute;">{{ connector(index) }}</span>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Screen } from '@/views/device/models/Screen/Screen'

@Component({
  name: 'TimeEditer'
})
export default class extends Vue {
  private timeEditer = [
    { time: '年', val: '' },
    { time: '月', val: '' },
    { time: '日', val: '' },
    { time: '时', val: '' },
    { time: '分', val: '' },
    { time: '秒', val: '' }
  ]
  private twoIntegerReg = /^[0-9]{1,2}$/

  private editingTime = false

  @Prop()
  private screen: Screen
  @Prop()
  private currentTime: number

  private connector(index: number) {
    if (index === 0 || index === 1) return '-'
    if (index === 3 || index === 4) return ':'
  }

  private get recordManager() {
    return this.screen && this.screen.recordManager
  }

  private get recordStatistic() {
    return this.recordManager && this.recordManager.recordStatistic
  }

  private get currentDate() {
    return this.recordManager && this.recordManager.currentDate * 1000
  }

  private mounted() {
    this.calcTime(this.currentTime)
  }

  private beforeDestroy() {
    console.log('组件销毁之前   :  this.editingTime', this.editingTime)
    if (this.editingTime) {
      // 失焦检查
      this.unfocusValidateTime()
    }
  }

  private editTime(index: number, val: any) {
    console.log('val:  ', val)
    console.log('index:  ', index)
    this.editingTime = true // 停止 currentTime 更新
    this.isPositiveInteger(index, val)
    if (index === 0) {
      this.isYear(val)
    } else if (index === 1) {
      this.isMonth(val)
    } else if (index === 2) {
      this.isDay(val)
    } else if (index === 3) {
      this.isHour(val)
    } else if (index === 4) {
      this.isMin(val)
    } else if (index === 5) {
      this.isSec(val)
    }
  }

  /* 校验 */
  /* 是否为正整数 */
  private isPositiveInteger(index: number, val: any) {
    const reg = /^[0-9]{1,4}$/ // 正整数
    if (!reg.test(val)) {
      console.log('正整数失败')
      this.timeEditer[index]['val'] = ''
    }
  }

  // 失焦提交时检查
  private unfocusValidateTime() {
    (this.isYearUnfocus(this.timeEditer[0]['val']) &&
    this.isMonthUnfocus(this.timeEditer[1]['val']) &&
    this.isDayUnfocus(this.timeEditer[2]['val']) &&
    this.isHourUnfocus(this.timeEditer[3]['val']) &&
    this.isMinUnfocus(this.timeEditer[4]['val']) &&
    this.isSecUnfocus(this.timeEditer[5]['val']) &&
    this.timeout())
      ? this.skipToTime() : this.unfocusValidateFail()
    // (this.isYearUnfocus(this.timeEditer[0]) &&
    // this.isMonthUnfocus(this.timeEditer[1]) &&
    // this.isDayUnfocus(this.timeEditer[2]) &&
    // this.isHourUnfocus(this.timeEditer[3]) &&
    // this.isMinUnfocus(this.timeEditer[4]) &&
    // this.isSecUnfocus(this.timeEditer[5]))
    //   ? console.log('失焦检查成功:    √') : console.log('失焦检测失败:    ×')
  }

  // 失焦检查成功，则发送请求
  private skipToTime() {
    // 绿色的勾勾，维持1秒然后跳到加载中，然后是播放时间
    console.log('跳转到指定时间')
    this.$emit('skipToTime', this.calcTimeReverse())
  }

  // 失焦检查失败，则提示失败
  private unfocusValidateFail() {
    // 失败时，显示红色的失败文字  “跳转时间有误，无法跳转”，维持1秒后返回current time，不返回到编辑时的时间
    console.log('失焦检查失败')
    this.$emit('skipToTime', -1)
  }
  /*
   *
   * 输入检查和失焦检查
   * 输入检查判定年月日时分秒的数字格式规范
   * 失焦检查判定是否符合合理范围,不符合则在用户提交修改后提示
   *
   * 年
   * */
  private isYear(val: any) {
    const reg = /^\+?[1-9][0-9]*$/
    this.timeEditer[0]['val'] = reg.test(val) ? val : ''
  }
  private isYearUnfocus(val: any) {
    const reg = /^[1-9]([0-9]{3})$/
    const currentYear = new Date().getUTCFullYear()
    return !(+val < 1970 || !reg.test(val) || +val > currentYear)
  }

  /* 月 */
  private isMonth(val: any) {
    this.timeEditer[1]['val'] = this.twoIntegerReg.test(val) ? val : ''
  }
  private isMonthUnfocus(val: any) {
    return !(+val > 12 || +val < 1)
  }

  /* 日 */
  private isDay(val: any) {
    this.timeEditer[2]['val'] = this.twoIntegerReg.test(val) ? val : ''
  }
  private isDayUnfocus(val: any) {
    if (+this.timeEditer[1]['val'] === 2) {
      return !(+val <= 0 || +val > 28)
    } else if (+this.timeEditer[1]['val'] === 1 || +this.timeEditer[1]['val'] === 3 || +this.timeEditer[1]['val'] === 5 || +this.timeEditer[1]['val'] === 7 || +this.timeEditer[1]['val'] === 8 || +this.timeEditer[1]['val'] === 10 || +this.timeEditer[1]['val'] === 12) {
      return !(+val <= 0 || +val > 31)
    } else {
      return !(+val <= 0 || +val > 30)
    }
  }

  /* 时 */
  private isHour(val: any) {
    this.timeEditer[3]['val'] = this.twoIntegerReg.test(val) ? val : ''
  }
  private isHourUnfocus(val: any) {
    return !(+val < 0 || +val > 24)
  }

  /* 分 */
  private isMin(val: any) {
    this.timeEditer[4]['val'] = this.twoIntegerReg.test(val) ? val : ''
  }
  private isMinUnfocus(val: any) {
    return !(+val < 0 || +val > 59)
  }

  /* 秒 */
  private isSec(val: any) {
    this.timeEditer[5]['val'] = this.twoIntegerReg.test(val) ? val : ''
  }
  private isSecUnfocus(val: any) {
    return !(+val < 0 || +val > 59)
  }

  /* 是否超过最新时间 */
  private timeout() {
    const currentTime = new Date().getTime()
    return currentTime > this.calcTimeReverse()
  }

  /* 将编辑时间转换为YYYY-MM-DD HH:MM:SS格式填入 input */
  private calcTime(time: number) {
    const formatTime = new Date(time * 1000).toLocaleString('sv-SE').split(' ')
    this.timeEditer[0]['val'] = formatTime[0].split('-')[0]
    this.timeEditer[1]['val'] = formatTime[0].split('-')[1]
    this.timeEditer[2]['val'] = formatTime[0].split('-')[2]
    this.timeEditer[3]['val'] = formatTime[1].split(':')[0]
    this.timeEditer[4]['val'] = formatTime[1].split(':')[1]
    this.timeEditer[5]['val'] = formatTime[1].split(':')[2]
  }

  /* 将 inputs 提交的时间转换为毫秒 */
  private calcTimeReverse() {
    const formatTime = this.timeEditer[0]['val'] + '-' + this.timeEditer[1]['val'] + '-' + this.timeEditer[2]['val'] + ' ' + this.timeEditer[3]['val'] + ':' + this.timeEditer[4]['val'] + ':' + this.timeEditer[5]['val']
    return new Date(formatTime).getTime()
  }

  @Watch('currentTime', {
    immediate: true
  })
  private onCurrentTimeChange() {
    if (!this.editingTime) {
      // 没有编辑的时候才一直更新时间
      this.calcTime(this.currentTime)
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep input::-webkit-input-placeholder {
    color: $primary;
}

::v-deep .el-input__inner {
  color: $primary;
  padding: 0;
  height: 23px;
  border-top-width: 0px;
  border-left-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 2px;
  /*outline: medium;*/
}
.time-editer__form {
  margin-right: -14px;
  margin-top: -2px;
}
// .time-editer__item {
//   margin-left: 20px;
// }
.address {
  position: absolute;
  top: -35px;
  height: 20px;
  &__wide {
    width: 40px;
    margin-left: -20px;
  }
  &__narrow {
    width: 20px;
  }
}
</style>
