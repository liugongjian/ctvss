<template>
  <el-dialog
    title="录像文件下载"
    :visible="dialogVisible"
    :close-on-click-modal="false"
    width="900px"
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
        <el-date-picker
          v-model="form.date"
          class="form-date"
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="时间区间:" prop="endTime" style="margin-left: 40px;">
        <vue-timepicker
          v-model="form.startTime"
          placeholder="开始时间"
          format="HH:mm:ss"
          hour-label="时"
          minute-label="分"
          second-label="秒"
          @close="pickToBar(1)"
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
          @close="pickToBar(2)"
          @open="resetWarning"
        />
      </el-form-item>
    </el-form>
    <div class="timeline__box">
      <div ref="timelineWrap" class="timeline__wrap">
        <div ref="timeline" class="timeline">
          <div
            ref="handle"
            class="timeline__handle"
            :style="`left: ${tmpHandlePos}%;`"
            @mousedown.stop.prevent="moveHandleStart($event)"
          >
            <div ref="timesign" class="timeline__start2end ">
              <span>{{ timeTransfer.formatTime1.HH + ':' + timeTransfer.formatTime1.mm + ':' + timeTransfer.formatTime1.ss }}</span>
            </div>
          </div>
          <div
            ref="handle2"
            class="timeline__handle timeline__handle__plus"
            :style="`left: ${tmpHandlePos2}%;`"
            @mousedown.stop.prevent="moveHandle2($event)"
          >
            <div ref="timesign2" class="timeline__start2end timeline__start2end__plus">
              <span>{{ timeTransfer.formatTime2.HH + ':' + timeTransfer.formatTime2.mm + ':' + timeTransfer.formatTime2.ss }}</span>
            </div>
          </div>
          <div class="timeline__range" :style="`left: ${rangeBarLeftPosition}%; width: ${rangeBarWidth}%`" />
          <div ref="bar" class="timeline__axis">
            <div v-for="i in 24" :key="i" class="timeline__hour" />
          </div>
        </div>
      </div>
    </div>
    <div class="warning-wrap">
      <div v-show="isWarning" class="warning">时间间隔请不要超过2小时</div>
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
import { roundToNearestMinutes } from 'date-fns'
@Component({
  name: 'SliceDownload',
  components: {
    VueTimepicker
  }
})
export default class extends Vue {
  @Prop({
    default: () => {
      return []
    }
  })
  public recordList!: Array<any>
  public isWarning = false

  @Prop()
  private deviceId!: number | string
  @Prop()
  private inProtocol!: string
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

  public timeTransfer: any = {
    numTime1: 0,
    formatTime1: { HH: '00', mm: '00', ss: '00' },
    numTime2: 0,
    formatTime2: { HH: '00', mm: '00', ss: '00' }
  }
  public tmpCurrentTime = 0
  public tmpHandlePos = 0
  public tmpHandlePos2 = 0
  public tmpHos = 0
  public tmpHos2 = 0
  public tmpCurrentTime2 = 0
  public tmpDeltatime = 0

  // 游标1拖动数据
  public handleDrag: any = {
    isDragging: false,
    timelineSize: null,
    deltaX: 0
  }

  // 游标2拖动数据
  public handle2Drag: any = {
    isDragging: false,
    timelineSize: null,
    deltaX: 0
  }

  private rangeBarWidth = 0
  private rangeBarLeftPosition = 0

  /**
   * 拖拽游标1
   */
  public moveHandleStart(e: MouseEvent) {
    this.isWarning = false
    this.handleDrag.isDragging = roundToNearestMinutes
    const $timeline: any = this.$refs.timeline
    this.handleDrag.timelineSize = $timeline.getBoundingClientRect()
    const $handle: any = this.$refs.handle
    const handleSize = $handle.getBoundingClientRect()
    const offsetX = e.x - handleSize.left
    this.handleDrag.deltaX = offsetX - handleSize.width
    window.addEventListener('mousemove', this.onHandleMove)
    window.addEventListener('mouseup', this.onHandleMouseup)
  }

  /**
   * 拖拽游标2
   */
  public moveHandle2(e: MouseEvent) {
    this.isWarning = false
    this.handle2Drag.isDragging = true
    const $timeline: any = this.$refs.timeline
    this.handle2Drag.timelineSize = $timeline.getBoundingClientRect()
    const $handle2: any = this.$refs.handle2
    const handleSize = $handle2.getBoundingClientRect()
    const offsetX = e.x - handleSize.left
    this.handle2Drag.deltaX = offsetX - handleSize.width
    this.tmpCurrentTime2 = this.handle2Drag.deltaX
    window.addEventListener('mousemove', this.onHandle2Move)
    window.addEventListener('mouseup', this.onHandle2Mouseup)
  }

  /**
   * 拖拽游标1时移动鼠标
   */
  public onHandleMove(e: MouseEvent) {
    if (!this.handleDrag.isDragging) return
    const $handle: any = this.$refs.handle
    this.tmpHandlePos = (e.x - this.handleDrag.deltaX - this.handleDrag.timelineSize.left) / this.handleDrag.timelineSize.width * 100
    if (this.tmpHandlePos >= 99.5) {
      if (this.tmpHandlePos > 100) {
        this.tmpHandlePos = 100
      }
      $handle.style.left = `calc(100% - 4px)`
    } else if (this.tmpHandlePos < 0) {
      this.tmpHandlePos = 0
      $handle.style.left = `0`
    }
    this.timeTransfer.numTime1 = +(this.tmpHandlePos * 24 * 60 * 60 / 100).toFixed(6)
    this.timeTransfer.formatTime1 = this.timeFormat(this.timeTransfer.numTime1)
    this.renderRangeBar()
    this.tmpHos = (e.x - this.handleDrag.deltaX - this.handleDrag.timelineSize.left)
    this.handlePosCheck()
    this.transitionHT()
  }
  /**
   * 拖拽游标2时移动鼠标
   */
  public onHandle2Move(e: MouseEvent) {
    const $handle2: any = this.$refs.handle2
    if (!this.handle2Drag.isDragging) return
    this.tmpHandlePos2 = (e.x - this.handle2Drag.deltaX - this.handle2Drag.timelineSize.left) / this.handle2Drag.timelineSize.width * 100
    if (this.tmpHandlePos2 >= 99.5) {
      if (this.tmpHandlePos2 > 100) {
        this.tmpHandlePos2 = 100
      }
      $handle2.style.left = `calc(100% - 4px)`
    } else if (this.tmpHandlePos2 < 0) {
      this.tmpHandlePos2 = 0
      $handle2.style.left = `0`
    }
    this.timeTransfer.numTime2 = +(this.tmpHandlePos2 * 24 * 60 * 60 / 100).toFixed(6)
    this.timeTransfer.formatTime2 = this.timeFormat(this.timeTransfer.numTime2)
    this.renderRangeBar()
    this.handlePosCheck()
    this.transitionHT()
    this.tmpHos2 = (e.x - this.handle2Drag.deltaX - this.handle2Drag.timelineSize.left)
  }

  /**
   * 计算区间条位置和宽度
   */
  private renderRangeBar(flag?: any, tmp?: any) {
    let minPos = Math.min(this.tmpHandlePos2, this.tmpHandlePos)
    let maxPos = Math.max(this.tmpHandlePos2, this.tmpHandlePos)
    if (tmp) {
      // start pick to bar
      if (flag === 1) {
        minPos = Math.min(this.tmpHandlePos2, tmp)
        maxPos = Math.max(this.tmpHandlePos2, tmp)
      }
      // end pick to bar
      if (flag === 2) {
        minPos = Math.min(this.tmpHandlePos, tmp)
        maxPos = Math.max(this.tmpHandlePos, tmp)
      }
    }
    this.rangeBarWidth = (maxPos - minPos) < 100 ? (maxPos - minPos) : 100
    this.rangeBarLeftPosition = minPos
  }

  /**
   * 拖拽游标1后抬起鼠标
   */
  public onHandleMouseup() {
    this.handleDrag.isDragging = false
    this.handleUpReset()
    this.tmpDeltatime = this.tmpHos2 - this.tmpHos
    this.handlePosCheck()
    this.showWarning(Math.abs(this.tmpDeltatime), -1, -1)
    this.form.startTime = this.timeOrder().startTime
    this.form.endTime = this.timeOrder().endTime
    window.removeEventListener('mousemove', this.onHandleMove)
    window.removeEventListener('mouseup', this.onHandleMouseup)
  }
  /**
   * 拖拽游标2后抬起鼠标
   */
  public onHandle2Mouseup() {
    this.handle2Drag.isDragging = false
    this.handleUpReset()
    this.tmpDeltatime = this.tmpHos2 - this.tmpHos
    this.handlePosCheck()
    this.showWarning(Math.abs(this.tmpDeltatime), -1, -1)
    this.form.startTime = this.timeOrder().startTime
    this.form.endTime = this.timeOrder().endTime
    window.removeEventListener('mousemove', this.onHandle2Move)
    window.removeEventListener('mouseup', this.onHandle2Mouseup)
  }

  // 修正 time sign 横向位置
  public handlePosCheck() {
    const $handle: any = this.$refs.handle
    const $handle2: any = this.$refs.handle2
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
  public timeSignChange(flag: any, ee: any, tr: any, bl: any, ss: any, left: any) {
    const $timeSign: any = this.$refs.timesign
    const $timeSign2: any = this.$refs.timesign2
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
  public showWarning(deltaTime: any, sec1: any, sec2: any) {
    // 拖动检测
    if (sec1 === -1 && sec2 === -1) {
      if (deltaTime > 77.828125) {
        this.isWarning = true
      } else {
        this.isWarning = false
      }
    }
    // pick 检测
    if (deltaTime === -1) {
      if (Math.abs(sec1 - sec2) > 7200) {
        this.isWarning = true
      } else {
        this.isWarning = false
      }
    }
  }

  // 修正 handle 和 time sign 高度
  public transitionHT() {
    const $handle: any = this.$refs.handle
    const $handle2: any = this.$refs.handle2
    const $timeSign2: any = this.$refs.timesign2
    if (!$handle || !$handle2) return
    const handleLocation = $handle.getBoundingClientRect()
    const handle2Location = $handle2.getBoundingClientRect()
    if (Math.abs(handleLocation.x - handle2Location.x) <= 106) {
      // 升起来
      $handle2.style.height = `76px`
      $timeSign2.style.bottom = `55px`
    } else {
      // 降下去
      $handle2.style.height = `50px`
      $timeSign2.style.bottom = `29px`
    }
  }

  // 时间格式
  public timeFormat(time: any) {
    if (time === undefined) {
      time = 0
    }
    let formatedTime: any = {
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
    return formatedTime
  }

  public timeOrder() {
    let startTime = this.timeTransfer.numTime1 < this.timeTransfer.numTime2 ? this.timeTransfer.formatTime1 : this.timeTransfer.formatTime2
    let endTime = this.timeTransfer.numTime1 >= this.timeTransfer.numTime2 ? this.timeTransfer.formatTime1 : this.timeTransfer.formatTime2
    return { startTime, endTime }
  }

  public pickToBar(flag: any) {
    const $handle: any = this.$refs.handle
    const $handle2: any = this.$refs.handle2
    let numsec1 = this.form.startTime.HH * 60 * 60 + this.form.startTime.mm * 60 + parseInt(this.form.startTime.ss)
    let numsec2 = this.form.endTime.HH * 60 * 60 + this.form.endTime.mm * 60 + parseInt(this.form.endTime.ss)
    if (flag === 1) {
      // start time changes
      // 和 handle 绑定
      let tmp = +(numsec1 * 100 / 86400).toFixed(4) // %
      this.timeTransfer.formatTime1 = this.form.startTime
      if (tmp >= 99.5) {
        $handle.style.left = `calc(100% - 4px)`
        this.tmpHandlePos = 99.5
      } else {
        this.tmpHandlePos = tmp
      }
      this.tmpHos = this.tmpHandlePos * 850 // tmpHos 同步
      this.renderRangeBar(1, tmp)
      this.$nextTick(this.handlePosCheck)
    } else if (flag === 2) {
      // end time
      // 和 handle2 绑定
      let tmp = +(numsec2 * 100 / 86400).toFixed(4)
      this.timeTransfer.formatTime2 = this.form.endTime
      this.tmpHos2 = tmp
      if (tmp >= 99.5) {
        $handle2.style.left = `calc(100% - 4px)`
        this.tmpHandlePos2 = 99.5
      } else {
        this.tmpHandlePos2 = tmp
      }
      this.tmpHos2 = this.tmpHandlePos2 * 850 // tmpHos 同步
      this.renderRangeBar(2, tmp)
      this.$nextTick(this.handlePosCheck)
    }
    this.showWarning(-1, numsec1, numsec2)
  }

  // 指针越界归位
  public handleUpReset() {
    if (this.tmpHos >= 850) {
      this.tmpHos = 850
    } else if (this.tmpHos <= 0) {
      this.tmpHos = 0
    }
    if (this.tmpHos2 >= 850) {
      this.tmpHos2 = 850
    } else if (this.tmpHos2 <= 0) {
      this.tmpHos2 = 0
    }
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
            deviceId: this.deviceId,
            startTime: startTime / 1000,
            endTime: endTime / 1000,
            fileFormat: 'mp4',
            inProtocol: this.inProtocol
          })
          if (res.downloadUrl) {
            const link: HTMLAnchorElement = document.createElement('a')
            link.setAttribute('href', res.downloadUrl)
            link.click()
            link.remove()
          }
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

  private closeDialog(isRefresh: boolean = false) {
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
    position: absolute;
    margin: 0;
    ::v-deep .vue__time-picker, ::v-deep .vue__time-picker input.display-time {
      width: 132px;
      z-index: 2007;
    }
    .time-range-gap {
      margin: 0 10px;
    }
  }
  ::v-deep .dialog-footer {
    padding-top: 0;
  }
  .form-date {
    width: 100%;
  }
  .floatbox {
    float: left;
    width: 300px;
    height: 15px;
  }
  .warning-wrap {
    height: 15px;
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
    overflow-x: hidden;
    margin-top: 30px;
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
