<template>
  <div class="time-editer">
    <div v-for="(item, index) in timeEditer" :key="index" class="address" :class="`address__${index === 0 ? 'wide' : 'narrow'}`">
      <el-input :id="`${index}`" :ref="`${index}`" v-model="item.val" :class="`${'input' + index}`" :placeholder="item.time" :maxlength="`${index > 0 ? 2 : 4}`" @input="editTime(index,item.val)" />
      <span class="split">{{ connector(index) }}</span>
    </div>
    <div v-if="error" class="time-editer-error">时间格式错误</div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Screen } from '@vss/device/services/Screen/Screen'
import { setTimeout } from 'timers'

@Component({
  name: 'TimeEditer'
})
export default class extends Vue {
  @Prop()
  private screen: Screen
  @Prop()
  private currentTime: number

  private escape = false
  private error = false

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

  private get recordManager() {
    return this.screen && this.screen.recordManager
  }

  private get recordStatistic() {
    return this.recordManager && this.recordManager.recordStatistic
  }

  private get currentDate() {
    return this.recordManager && this.recordManager.currentDate * 1000
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

  private mounted() {
    this.calcTime(this.currentTime)
    document.body.addEventListener('keydown', this.onHotkey)
    document.body.addEventListener('keypress', this.inputInsert)
    setTimeout(() => {
      const hour = this.$refs[3][0]
      hour.focus()
      hour.$el.children[0].setSelectionRange(0, 2)
      window.addEventListener('click', this.closeTimeEditer)
    }, 50)
  }

  private beforeDestroy() {
    if (this.editingTime && !this.escape) {
      // 失焦检查
      this.unfocusValidateTime()
    }
  }

  private destroyed() {
    document.body.removeEventListener('keydown', this.onHotkey)
    document.body.removeEventListener('keypress', this.inputInsert)
    window.removeEventListener('click', this.closeTimeEditer)
  }

  private connector(index: number) {
    if (index === 0 || index === 1) return '-'
    if (index === 3 || index === 4) return ':'
  }

  private arrowMove(e: any) {
    e.stopPropagation()
    const index = e.target.id ? +e.target.id : null
    const currentInput = this.getInputDom(+e.target.id)
    const start = currentInput.start
    const end = currentInput.end
    if (e.code === 'ArrowLeft' && +start === 0) {
      const nextInput: any = index > 0 ? this.getInputDom((index - 1)) : null
      if (!nextInput) return
      this.$refs['' + index][0].blur()
      this.$refs['' + (index - 1)][0].focus()
      e.preventDefault()
      nextInput.input.setSelectionRange(nextInput.input.value.length, nextInput.input.value.length)
    }
    if (e.code === 'ArrowRight' && (+end === e.target.value.length)) {
      const nextInput: any = index < 5 ? this.getInputDom((index + 1)) : null
      if (!nextInput) return
      this.$refs['' + index][0].blur()
      this.$refs['' + (index + 1)][0].focus()
      e.preventDefault()
      nextInput.input.setSelectionRange(0, 0)
    }
  }

  private onHotkey(e: KeyboardEvent) {
    switch (e.code) {
      case 'Escape':
        this.escape = true
        this.$emit('close')
        break
      case 'Enter':
        this.$emit('close')
        break
      case 'Backspace':
        this.onBackSpace(e)
        break
      case 'ArrowRight':
        this.arrowMove(e)
        break
      case 'ArrowLeft':
        this.arrowMove(e)
        break
    }
  }

  private onBackSpace(e: any) {
    const index = +e.target.id
    if (index === 0) return
    if (this.timeEditer[index]['val'] === '' && (index - 1) >= 0) {
      // 回退一个时间input
      this.$refs['' + index][0].blur()
      this.$refs['' + (index - 1)][0].focus()
    }
  }

  private getInputDom(index: number) {
    return {
      input: document.getElementById(('' + index)) || null,
      start: document.getElementById(('' + index))['selectionStart'] || null,
      end: document.getElementById(('' + index))['selectionEnd'] || null
    }
  }

  // listener 的触发时机在editTime之后，所以可以在这里进行替换操作，和移位操作
  private inputInsert(e: any) {
    e.stopPropagation()
    e.preventDefault()
    const selection = window.getSelection().toString()
    const index = +e.target.id
    this.editingTime = true // input 监听不到在满输入状况下的数据替换所导致的变化
    const currentInput: any = this.getInputDom(index)
    const nextInput: any = index < 5 ? this.getInputDom((index + 1)) : null
    // +' ' = 0,输入的是数字再做操作
    if ((+e.key === 0 || +e.key) && e.key !== ' ') {
      // 有选中范围文本则替换范围内文本
      if (selection) {
        this.timeEditer[index]['val'] = this.timeEditer[index]['val'].substr(0, currentInput.start) + e.key + this.timeEditer[index]['val'].substr(currentInput.end)
        this.$nextTick(() => {
          currentInput.input.setSelectionRange(currentInput.start + 1, currentInput.start + 1)
        })
      } else {
        // 光标处覆盖下一位数字，光标到尾自动跳下一个input
        if ((index === 0 && currentInput.end !== 4) || (index !== 0 && currentInput.end !== 2)) {
          this.timeEditer[index]['val'] = this.timeEditer[index]['val'].substr(0, currentInput.start) + e.key + this.timeEditer[index]['val'].substr(currentInput.start + 1)
          this.$nextTick(() => {
            currentInput.input.setSelectionRange(currentInput.start + 1, currentInput.start + 1)
          })
        } else {
          if (!nextInput) return
          this.$refs['' + index][0].blur()
          this.$refs['' + (index + 1)][0].focus()
          nextInput.start = 0
          this.timeEditer[index + 1]['val'] = this.timeEditer[index + 1]['val'].substr(0, nextInput.start) + e.key + this.timeEditer[index + 1]['val'].substr(nextInput.start + 1)
          this.$nextTick(() => {
            nextInput.input.setSelectionRange(nextInput.start + 1, nextInput.start + 1)
          })
        }
      }
    }
  }

  private editTime(index: number, val: any) {
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
    this.checkTime())
      ? this.change() : this.unfocusValidateFail()
  }

  // 失焦检查成功，则发送请求
  private change() {
    this.$emit('change', this.calcTimeReverse() / 1000)
  }

  // 失焦检查失败，则提示失败
  private unfocusValidateFail() {
    // 失败时，显示红色的失败文字
    this.error = true
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
    // 检测执行顺序是在 event listener 之前的
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
    } else if (+this.timeEditer[1]['val'] === 1 
              || +this.timeEditer[1]['val'] === 3 
              || +this.timeEditer[1]['val'] === 5 
              || +this.timeEditer[1]['val'] === 7 
              || +this.timeEditer[1]['val'] === 8 
              || +this.timeEditer[1]['val'] === 10 
              || +this.timeEditer[1]['val'] === 12) 
    {
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
  private checkTime() {
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
    const formatTime = this.timeEditer[0]['val'] + '-' + this.timeEditer[1]['val']
                        + '-' + this.timeEditer[2]['val'] + ' ' + this.timeEditer[3]['val']
                        + ':' + this.timeEditer[4]['val'] + ':' + this.timeEditer[5]['val']
    return new Date(formatTime).getTime()
  }

  /**
   * 时间编辑器
   * 点击时间编辑器外区域则隐藏编辑器并提交修改
   * 在编辑区域内，执行输入时间的逻辑
   * 不在区域内部，确认修改时间，关闭修改器，移除监听事件
   * */
  private closeTimeEditer(e: any) {
    let target = e.target
    while (target) {
      if (target.className.startsWith('time-editer')) {
        return
      }
      target = target.parentElement
    }
    if (this.checkTime()) {
      this.$emit('close')
    } else {
      this.unfocusValidateFail()
    }
  }
}
</script>
<style lang="scss" scoped>
  .time-editer {
    position: absolute;
    left: 50%;
    top: -28px;
    margin-left: -100px;
    width: 200px;
    display: flex;
  }

  .address {
    display: flex;
    align-items: center;

    &:nth-child(3) {
      margin-right: 5px;
    }

    .split {
      padding: 0 2px;
      color: #999;
    }

    ::v-deep .el-input {
      line-height: 23px;
    }

    ::v-deep .el-input__inner {
      text-align: center;
      padding: 0;
      height: 23px;
      font-size: 12px;
    }

    &__wide .el-input {
      width: 40px;
    }

    &__narrow .el-input {
      width: 22px;
    }
  }

  .time-editer-error {
    position: absolute;
    background: $red;
    color: #fff;
    font-size: 12px;
    right: -100px;
    top: 0;
    padding: 5px 10px;
    border-radius: 5px;

    &:after {
      content: ' ';
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-color: transparent;
      border-style: solid;
      border-width: 6px;
      top: 6px;
      left: -4px;
      border-left-width: 0;
      border-right-color: $red;
    }
  }
</style>
