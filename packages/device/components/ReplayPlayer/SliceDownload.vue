<template>
  <el-dialog
    title="录像文件下载"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
    :append-to-body="true"
    center
    @close="closeDialog"
  >
    <el-form
      ref="dataForm"
      class="form"
      :inline="true"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="100px"
    >
      <el-form-item label="日期:" prop="date">
        <Datepicker class="form-date" :screen="screen" size="small" @change="onDateChange" />
      </el-form-item>
      <el-form-item label="时间区间:" prop="endTime" class="time-range">
        <vue-timepicker
          v-model="form.startTime"
          placeholder="开始时间"
          format="HH:mm:ss"
          hour-label="时"
          minute-label="分"
          second-label="秒"
          manual-input
          auto-scroll
          @close="pickToBar"
          @open="resetWarning"
        />
        <span class="time-range-gap">至</span>
        <vue-timepicker
          v-model="form.endTime"
          placeholder="结束时间"
          format="HH:mm:ss"
          hour-label="时"
          minute-label="分"
          second-label="秒"
          manual-input
          auto-scroll
          @close="pickToBar"
          @open="resetWarning"
        />
      </el-form-item>
    </el-form>
    <div class="timeline__box">
      <div ref="timelineWrap" class="timeline__wrap">
        <div ref="timeline" class="timeline">
          <div
            v-for="(handle, index) in handleList"
            :id="`handle-${index}`"
            :key="index"
            class="timeline__handle"
            :class="{ 'timeline__handle__plus': index === 0 }"
            :style="`left: ${handle.tmpHandlePos}%;`"
            @mousedown.stop.prevent="moveHandleStart($event, handle)"
          >
            <div :id="`timesign-${index}`" class="timeline__start2end" :class="{ 'timeline__start2end__plus': index === 0 }">
              <span>{{ handle.formatTime.HH + ':' + handle.formatTime.mm + ':' + handle.formatTime.ss }}</span>
            </div>
          </div>
          <div class="timeline__range" :style="`left: ${rangeBarLeftPosition}%; width: ${rangeBarWidth}%`" />
          <div ref="bar" class="timeline__axis">
            <div v-for="i in 24" :key="i" class="timeline__hour">
              <span v-if="!((i - 1)%6)">{{ renderHour(i) }}</span>
              <span v-if="i === 24">{{ i }}:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="warning-wrap">
      <div v-show="isWarning" class="warning">{{ warningText }}</div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="submitting" :disabled="isWarning" @click="submit">
        下 载
      </el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getDeviceRecord } from '@/api/device'
import VueTimepicker from 'vue2-timepicker'
import Datepicker from '../ScreenBoard/components/DatePicker.vue'
import { cloneDeep } from 'lodash'
import { addLog } from '@vss/device/api/operationLog'

@Component({
  name: 'SliceDownload',
  components: {
    VueTimepicker,
    Datepicker
  }
})
export default class extends Vue {
  @Prop()
  private screen
  private isWarning = false
  private warningText = ''
  private dialogVisible = true
  private submitting = false
  private today = new Date()
  private form: any = {
    date: this.today,
    startTime: { HH: '00', mm: '00', ss: '00' },
    endTime: { HH: '00', mm: '00', ss: '00' }
  }
  private rules = {
    date: [
      { required: true, message: '请选择日期', trigger: 'submit' }
    ],
    endTime: [
      { required: true, message: '请选择时间区间', trigger: 'submit' },
      { validator: this.validateTime, trigger: 'change' }
    ]
  }

  private handleList: any = [
    {
      index: 0,
      $handle: null,
      numTime: 0,
      formatTime: { HH: '00', mm: '00', ss: '00' },
      tmpCurrentTime: 0,
      tmpHandlePos: 0,
      tmpHos: 0,
      isDragging: false,
      deltaX: 0
    },
    {
      index: 1,
      $handle: null,
      numTime: 0,
      formatTime: { HH: '00', mm: '00', ss: '00' },
      tmpCurrentTime: 0,
      tmpHandlePos: 0,
      tmpHos: 0,
      isDragging: false,
      deltaX: 0
    }
  ]

  private currentHandleIndex = -1
  private timelineSize: any = null

  private rangeBarWidth = 0
  private rangeBarLeftPosition = 0

  private mounted() {
    this.$nextTick(() => {
      if (this.screen.recordManager && this.screen.recordManager.currentDate) {
        this.form.date = new Date(this.screen.recordManager.currentDate * 1000)
      }
      const $timeline: any = this.$refs.timeline
      this.timelineSize = $timeline.getBoundingClientRect()
      this.handleList[0].$handle = $timeline.querySelector('#handle-0')
      this.handleList[1].$handle = $timeline.querySelector('#handle-1')
    })
  }

  private onDateChange(date) {
    this.form.date = new Date(date * 1000)
  }

  private renderHour(i: number) {
    return i - 1 < 12 ? `0${i - 1}:00` : `${i - 1}:00`
  }

  /**
   * 拖拽游标1
   */
  private moveHandleStart(e: MouseEvent, handleData: any) {
    this.isWarning = false
    handleData.isDragging = true
    this.currentHandleIndex = handleData.index
    const handleSize = handleData.$handle.getBoundingClientRect()
    const offsetX = e.x - handleSize.left
    handleData.deltaX = offsetX - handleSize.width
    window.addEventListener('mousemove', this.onHandleMove)
    window.addEventListener('mouseup', this.onHandleMouseup)
  }

  /**
   * 拖拽游标时移动鼠标
   */
  private onHandleMove(e: MouseEvent) {
    const handleData = this.handleList[this.currentHandleIndex]
    if (!handleData.isDragging) return
    handleData.tmpHandlePos = (e.x - handleData.deltaX - this.timelineSize.left) / this.timelineSize.width * 100
    // 处理边界情况
    if (handleData.tmpHandlePos >= 99.5) {
      if (handleData.tmpHandlePos > 100) {
        handleData.tmpHandlePos = 100
      }
      handleData.$handle.style.left = 'calc(100% - 4px)'
    } else if (handleData.tmpHandlePos < 0) {
      handleData.tmpHandlePos = 0
      handleData.$handle.style.left = '0'
    }
    handleData.numTime = +(handleData.tmpHandlePos * 24 * 60 * 60 / 100).toFixed(6)
    handleData.formatTime = this.timeFormat(handleData.numTime, true)
    this.renderRangeBar()
    handleData.tmpHos = (e.x - handleData.deltaX - this.timelineSize.left)
    this.handlePosCheck()
    this.transitionHT()
  }

  /**
   * 拖拽游标1后抬起鼠标
   */
  private onHandleMouseup() {
    const handleData = this.handleList[this.currentHandleIndex]
    handleData.isDragging = false
    this.handleUpReset()
    const deltaTime = this.handleList[0].tmpHos - this.handleList[1].tmpHos
    this.handlePosCheck()
    this.showWarning(Math.abs(deltaTime), -1, -1)
    this.form.startTime = this.timeOrder().startTime
    this.form.endTime = this.timeOrder().endTime
    window.removeEventListener('mousemove', this.onHandleMove)
    window.removeEventListener('mouseup', this.onHandleMouseup)
  }

  /**
   * 计算区间条位置和宽度
   */
  private renderRangeBar() {
    const minPos = Math.min(this.handleList[0].tmpHandlePos, this.handleList[1].tmpHandlePos)
    const maxPos = Math.max(this.handleList[0].tmpHandlePos, this.handleList[1].tmpHandlePos)
    this.rangeBarWidth = (maxPos - minPos) < 100 ? (maxPos - minPos) : 100
    this.rangeBarLeftPosition = minPos
  }

  // 修正 time sign 横向位置
  private handlePosCheck() {
    const $handle: any = this.handleList[0].$handle
    const $handle2: any = this.handleList[1].$handle
    const $bar: any = this.$refs.bar
    if (!$handle || !$handle2) return
    const handleLocation = $handle.getBoundingClientRect()
    const handle2Location = $handle2.getBoundingClientRect()
    const border = $bar.getBoundingClientRect()
    if (handleLocation.left <= (border.left + 50) && handleLocation.left >= border.left) {
      this.timeSignChange(1, 5, 5, 0, 0, 0)
    // 1 右侧过渡段，修正 time sign
    } else if (handleLocation.left >= (border.right - 50) && handleLocation.left <= border.right) {
      this.timeSignChange(1, 0, 0, 5, 5, -60)
    } else if (handleLocation.left < (border.right - 50) && handleLocation.left > (border.left + 50)) {
      // 设置 time sign
      this.timeSignChange(1, 5, 5, 5, 5, -30)
    }
    // 2 左侧过渡段，修正 time sign2
    if (handle2Location.left <= (border.left + 50) && handle2Location.left >= border.left) {
      this.timeSignChange(2, 5, 5, 0, 0, 0)
    // 2 右侧过渡段，修正 time sign2
    } else if (handle2Location.left >= (border.right - 50) && handle2Location.left <= border.right) {
      this.timeSignChange(2, 0, 0, 5, 5, -60)
    // 2 在中间
    } else if (handle2Location.left < (border.right - 50) && handle2Location.left > (border.left + 50)) {
      // 设置 time sign
      this.timeSignChange(2, 5, 5, 5, 5, -30)
    }
  }

  // time sign 样式修正
  private timeSignChange(flag: any, ee: any, tr: any, bl: any, ss: any, left: any) {
    const $timeline: any = this.$refs.timeline
    const $timeSign: any = $timeline.querySelector('#timesign-0')
    const $timeSign2: any = $timeline.querySelector('#timesign-1')
    if (flag === 1) {
      $timeSign.style.borderStartStartRadius = `${ss}px`
      $timeSign.style.borderBottomLeftRadius = `${bl}px`
      $timeSign.style.borderEndEndRadius = `${ee}px`
      $timeSign.style.borderTopRightRadius = `${tr}px`
      $timeSign.style.left = `${left}px`
    }
    if (flag === 2) {
      $timeSign2.style.left = `${left}px`
      $timeSign2.style.borderEndEndRadius = `${ee}px`
      $timeSign2.style.borderTopRightRadius = `${tr}px`
      $timeSign2.style.borderBottomLeftRadius = `${bl}px`
      $timeSign2.style.borderStartStartRadius = `${ss}px`
    }
  }

  // 显示 warning
  private showWarning(deltaTime: any, startTimeSec: any, endTimeSec: any) {
    const warnings = {
      O2H: '时间间隔请不要超过2小时',
      SBTE: '起始时间须早于结束时间'
    }
    // 拖动检测
    if (startTimeSec === -1 && endTimeSec === -1) {
      if (deltaTime > 71) {
        this.isWarning = true
        this.warningText = warnings.O2H
      } else {
        this.isWarning = false
      }
    }
    // pick 检测
    if (deltaTime === -1) {
      if (startTimeSec > endTimeSec) {
        this.isWarning = true
        this.warningText = warnings.SBTE
      } else if (Math.abs(startTimeSec - endTimeSec) > 7200) {
        this.isWarning = true
        this.warningText = warnings.O2H
      } else {
        this.isWarning = false
      }
    }
  }

  // 修正 handle 和 time sign 高度
  private transitionHT() {
    const $handle: any = this.handleList[0].$handle
    const $handle2: any = this.handleList[1].$handle
    const $timeSign: any = $handle.querySelector('.timeline__start2end')
    if (!$handle || !$handle2) return
    const handleLocation = $handle.getBoundingClientRect()
    const handle2Location = $handle2.getBoundingClientRect()
    if (Math.abs(handleLocation.x - handle2Location.x) <= 80) {
      // 升起来
      $handle.style.height = '76px'
      $timeSign.style.bottom = '55px'
    } else {
      // 降下去
      $handle.style.height = '50px'
      $timeSign.style.bottom = '29px'
    }
  }

  // 时间格式
  private timeFormat(time: any, isIgnoreSecond?: boolean) {
    if (time === undefined) {
      time = 0
    }
    const formatedTime: any = {
      HH: '',
      mm: '',
      ss: ''
    }
    formatedTime.ss = '00'
    formatedTime.ss = '' + (parseInt(time) > 10 ? parseInt(time) : '0' + parseInt(time))
    if (formatedTime.ss > 59) {
      formatedTime.mm = '' + (parseInt((Math.floor(formatedTime.ss / 60)).toFixed()) >= 10 ? parseInt((Math.floor(formatedTime.ss / 60)).toFixed()) : '0' + parseInt((Math.floor(formatedTime.ss / 60)).toFixed()))
      formatedTime.ss = '' + (parseInt((Math.floor(formatedTime.ss % 60)).toFixed()) >= 10 ? parseInt((Math.floor(formatedTime.ss % 60)).toFixed()) : '0' + parseInt((Math.floor(formatedTime.ss % 60)).toFixed()))
      if (formatedTime.mm > 59) {
        formatedTime.HH = '' + (parseInt((Math.floor(formatedTime.mm / 60)).toFixed()) >= 10 ? parseInt((Math.floor(formatedTime.mm / 60)).toFixed()) : '0' + parseInt((Math.floor(formatedTime.mm / 60)).toFixed()))
        formatedTime.mm = '' + (parseInt((Math.floor(formatedTime.mm % 60)).toFixed()) >= 10 ? parseInt((Math.floor(formatedTime.mm % 60)).toFixed()) : '0' + parseInt((Math.floor(formatedTime.mm % 60)).toFixed()))
      }
    }
    if (!formatedTime.HH) formatedTime.HH = '00'
    if (!formatedTime.mm) formatedTime.mm = '00'
    if (!formatedTime.ss) formatedTime.ss = '00'
    if (formatedTime.HH === '24') {
      formatedTime.HH = '23'
      formatedTime.mm = '59'
      formatedTime.ss = '59'
    }
    if (isIgnoreSecond) {
      formatedTime.ss = '00'
    }
    return formatedTime
  }

  /**
   * 判断时间先后
   */
  private timeOrder() {
    let startTime, endTime
    if (this.handleList[0].numTime < this.handleList[1].numTime) {
      startTime = this.handleList[0].formatTime
      endTime = this.handleList[1].formatTime
    } else {
      startTime = this.handleList[1].formatTime
      endTime = this.handleList[0].formatTime
    }
    return { startTime, endTime }
  }

  /**
   * 当时间选择器值改变更新游标位置
   */
  private pickToBar() {
    const startTimeSec = this.form.startTime.HH * 60 * 60 + this.form.startTime.mm * 60 + parseInt(this.form.startTime.ss)
    const endTimeSec = this.form.endTime.HH * 60 * 60 + this.form.endTime.mm * 60 + parseInt(this.form.endTime.ss)

    let minHandleData, maxHandleData
    let minTimeSec, maxTimeSec
    let minTime, maxTime

    if (this.handleList[0].tmpHos < this.handleList[1].tmpHos) {
      minHandleData = this.handleList[0]
      maxHandleData = this.handleList[1]
    } else {
      minHandleData = this.handleList[1]
      maxHandleData = this.handleList[0]
    }

    if (startTimeSec > endTimeSec) {
      minTimeSec = endTimeSec
      maxTimeSec = startTimeSec
      minTime = cloneDeep(this.form.endTime)
      maxTime = cloneDeep(this.form.startTime)
    } else {
      minTimeSec = startTimeSec
      maxTimeSec = endTimeSec
      minTime = cloneDeep(this.form.startTime)
      maxTime = cloneDeep(this.form.endTime)
    }

    // start time changes
    const minSecPercent = +(minTimeSec * 100 / 86400).toFixed(4) // %
    minHandleData.formatTime = minTime
    if (minSecPercent >= 99.5) {
      minHandleData.style.left = 'calc(100% - 4px)'
      minHandleData.tmpHandlePos = 99.5
    } else {
      minHandleData.tmpHandlePos = minSecPercent
    }
    minHandleData.tmpHos = minHandleData.tmpHandlePos / 100 * this.timelineSize.width // tmpHos 同步

    // end time
    const maxSecPercent = +(maxTimeSec * 100 / 86400).toFixed(4) // %
    maxHandleData.formatTime = maxTime
    if (maxSecPercent >= 99.5) {
      maxHandleData.style.left = 'calc(100% - 4px)'
      maxHandleData.tmpHandlePos = 99.5
    } else {
      maxHandleData.tmpHandlePos = maxSecPercent
    }
    maxHandleData.tmpHos = maxHandleData.tmpHandlePos / 100 * this.timelineSize.width // tmpHos 同步

    this.$nextTick(() => {
      this.renderRangeBar()
      this.handlePosCheck()
      this.transitionHT()
    })
    this.showWarning(-1, startTimeSec, endTimeSec)
  }

  // 指针越界归位
  private handleUpReset() {
    this.handleList.forEach((handle: any) => {
      if (handle.tmpHos >= this.timelineSize.width) {
        handle.tmpHos = this.timelineSize.width
      } else if (handle.tmpHos <= 0) {
        handle.tmpHos = 0
      }
    })
  }

  private validateTime(rule: any, value: string, callback: Function) {
    const { startTime, endTime } = this.getRangeTime()
    if (endTime - startTime > 2 * 3600 * 1000) {
      callback(new Error(' '))
    } else {
      callback()
    }
  }

  private async submit() {
    const form: any = this.$refs.dataForm
    form.validate(async(valid: any) => {
      if (valid) {
        try {
          this.submitting = true
          const { startTime, endTime } = this.getRangeTime()
          const res = await getDeviceRecord({
            deviceId: this.screen.deviceId,
            startTime: startTime / 1000,
            endTime: endTime / 1000,
            fileFormat: 'mp4',
            inProtocol: this.screen.inProtocol
          })
          if (res.downloadUrl) {
            const link: HTMLAnchorElement = document.createElement('a')
            link.setAttribute('href', res.downloadUrl)
            link.click()
            link.remove()
          }
          addLog({
            deviceId: this.screen.deviceId.toString(),
            inProtocol: this.screen.inProtocol,
            operationName: '下载云端录像'
          })
        } catch (e) {
          this.$message.error(e.message)
        } finally {
          this.submitting = false
        }
      }
    })
  }

  private resetWarning() {
    this.isWarning = false
  }

  private closeDialog(isRefresh = false) {
    this.dialogVisible = false
    this.$emit('on-close', isRefresh)
  }

  private getRangeTime() {
    const year = this.form.date.getFullYear()
    const month = this.form.date.getMonth()
    const date = this.form.date.getDate()
    const startTime = new Date(year, month, date, this.form.startTime.HH, this.form.startTime.mm, this.form.startTime.ss).getTime()
    const endTime = new Date(year, month, date, this.form.endTime.HH, this.form.endTime.mm, this.form.endTime.ss).getTime()
    return {
      startTime,
      endTime
    }
  }
}
</script>
<style lang="scss" scoped>
  .form {
    margin: 0;
    ::v-deep {
      .vue__time-picker, .vue__time-picker input.display-time {
        width: 170px;
        z-index: 2007;
        height: 32px;
        line-height: 32px;
      }
      .vue__time-picker .dropdown, .vue__time-picker-dropdown {
        width: 100%;
        height: 15em;

        .select-list {
          width: 100%;
          height: 15em;
        }
      }
      .vue__time-picker .dropdown ul li:not([disabled]).active, .vue__time-picker .dropdown ul li:not([disabled]).active:hover, .vue__time-picker .dropdown ul li:not([disabled]).active:focus, .vue__time-picker-dropdown ul li:not([disabled]).active, .vue__time-picker-dropdown ul li:not([disabled]).active:hover, .vue__time-picker-dropdown ul li:not([disabled]).active:focus {
        background: #fa8334;
      }
    }
    .time-range {
      margin-left: 35px;
    }
    .time-range-gap {
      margin: 0 10px;
    }
  }
  ::v-deep .dialog-footer {
    padding-top: 0;
  }
  .form-date {
    ::v-deep .el-date-editor {
      width: 190px;
    }
  }
  .floatbox {
    float: left;
    width: 300px;
    height: 15px;
  }
  .warning-wrap {
    padding-top: 10px;
    height: 25px;
  }
  .warning {
    text-align: center;
    color: red;
    font-size: 12px;
  }
  .timeline__box {
    position: relative;
  }
  .timeline__wrap {
    margin-top: -30px;
    * {
      user-select:none;
    }
  }
  .timeline {
    min-width: 600px;
    position: relative;
    margin: 75px 0 15px 0;
    display: flex;
    background: transparent;
    cursor: grab;
    &__range {
      position: absolute;
      bottom: 0;
      background: $primary;
      height: 7px;
      z-index: 11;
    }
    &__handle {
      position: absolute;
      z-index: 10;
      bottom: 0;
      border-right: 4px solid $primary;
      height: 50px;
      cursor: move;
      &__plus {
        height: 76px;
        z-index: 9;
        transition: height .3s;
      }
      .timeline__start2end {
        position: absolute;
        font-size: 12px;
        width: 60px;
        bottom: 29px;
        padding: 4px 0;
        border-end-end-radius: 5px;
        border-top-right-radius: 5px;
        border-start-start-radius: 0;
        border-bottom-left-radius: 0;
        text-align: center;
        background-color: $primary;
        color: white;
        transition: left .2s;
        &__plus {
          bottom: 55px;
          transition: all .3s;
        }
      }
    }
    &__axis {
      position: relative;
      display: flex;
      width: 100%;
      &__slice {
        position: absolute;
        width: 100%;
        left: 0;
        display: flex;
      }
    }
    &__hour {
      position: relative;
      flex: 1 1 0;
      text-align: center;
      border-right: 2px solid #E6E6E6;
      border-bottom: 7px solid #E6E6E6;
      padding: 6px 0;
      font-size: 11px;
      color: #E6E6E6;
      &:first-child {
        border-left: 2px solid;
      }
      span {
        position: absolute;
        bottom: -25px;
        left: -40%;
        color: $textGrey;
      }
      &:last-child {
        span {
          left: 50%;
          white-space: nowrap;
        }
      }
    }
    &__half__hour {
      flex: 1 1 0;
      border-left: 1px solid #E6E6E6;
      height: 5px;
      color: #E6E6E6;
      &:first-child {
        border-left: none;
      }
    }
    &__bar {
      position: absolute;
      bottom: 0;
      border-top: 12px solid #3e80c1;
      height: 100%;
      cursor: pointer;
    }
    &.dragging * {
      cursor: grabbing;
    }
  }
</style>
