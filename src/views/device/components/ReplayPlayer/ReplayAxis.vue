<template>
  <div ref="axisWrap" class="axis__wrap">
    <div class="axis__middle" :style="`height: ${settings.hourHeight + 5}px`" />
    <div class="axis__time">{{ screen && screen.isLoading ? '加载中' : formatedCurrentTime }}</div>
    <canvas ref="canvas" class="axis__canvas" :class="{'dragging': axisDrag.isDragging}" />
    <div class="axis__zoom">
      <div class="axis__zoom__btn" @click="zoom(1)"><svg-icon name="zoom-in" /></div>
      <div class="axis__zoom__btn" @click="zoom(0)"><svg-icon name="zoom-out" /></div>
    </div>
  </div>
</template>
<script lang="ts">
/**
 * 刻度组件
 * 1) 首先计算出秒/像素的比值，存为ratio，即每个像素包含多少秒，又可理解为每个像素的密度
 * 2) 拖动时间轴后算出偏移量delatX的像素值，然后除ratio，计算出拖拽后的时间戳
 * 3) 计算刻度位置时使用时间戳除ratio，转换为像素值
 */
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { dateFormat, getNextHour, prefixZero, currentTimeZeroMsec } from '@/utils/date'
import { Screen } from '@/views/device/models/Screen/Screen'
import { throttle } from 'lodash'

@Component({
  name: 'ReplayAxis'
})
export default class extends Vue {
  /* 时间轴拖动数据 */
  private axisDrag: any = {
    isDragging: false,
    deltaX: 0,
    startX: 0
  }
  /* 时间轴设置 */
  private settings = {
    width: 0,
    height: 0,
    scale: 24, // 缩放比例，画布显示的小时数量
    ratio: 0, // 比例尺(秒/每像素)
    // showTenMins: false,
    // showFiveMins: false,
    hourWidth: 2,
    hourHeight: 0,
    halfHourWidth: 1,
    halfHourHeight: 0,
    tenMinsWidth: 1,
    tenMinsHeight: 0,
    fiveMinsWidth: 1,
    fiveMinsHeight: 0,
    oneMinWidth: 1,
    oneMinHeight: 0,
    recordHeight: 0,
    spanThreshold: 10,
    hourSpan: null
  }
  /* 刻度数据 */
  private axisData = {
    hours: [],
    halfHours: [],
    tenMins: [],
    fiveMins: [],
    oneMins: [],
    records: []
  }
  /* 画布 */
  private canvas: HTMLCanvasElement
  /* 画布上下文 */
  private ctx: CanvasRenderingContext2D
  /* 尺寸监听器 */
  private resizeObserver: ResizeObserver
  /* 当前时间(时间戳/秒) */
  @Prop()
  private screen: Screen
  /* 当前时间(可修改) */
  private currentTime: number = 0
  /* 当前时间轴的头部时间 */
  private axisStartTime: number
  /* 当前时间轴的末尾时间 */
  private axisEndTime: number
  /* 格式化当前时间 */
  private get formatedCurrentTime() {
    return dateFormat(this.currentTime * 1000)
  }

  /* 监听播放器时间变化 */
  @Watch('screen.player.currentTime')
  private onCurrentTimeChange() {
    if (this.axisDrag.isDragging) return
    if (this.screen && this.screen.player) {
      const recordCurrentTime = this.screen.player.currentTime
      const offsetTime = this.screen.currentRecord.offsetTime || 0
      const duration = offsetTime > recordCurrentTime ? offsetTime : recordCurrentTime
      this.currentTime = this.screen.currentRecord.startTime + duration
    }
    this.generateData()
    this.draw()
  }

  private mounted() {
    this.calcSize()
    this.generateData()
    this.initCanvas()

    this.resizeObserver = new ResizeObserver(throttle(this.resize, 300))
    this.resizeObserver.observe(this.$refs.axisWrap as HTMLDivElement)
    window.addEventListener('keydown', this.onHotkey)
  }

  private beforeDestroy() {
    this.canvas.removeEventListener('mousedown', this.moveAxisStart)
    this.canvas.removeEventListener('wheel', this.onWheel)
    window.removeEventListener('keydown', this.onHotkey)
    if (this.resizeObserver) this.resizeObserver.disconnect()
  }

  /**
   * 构建刻度数据
   */
  private generateData() {
    /**
     * 计算偏移量
     * 1) 起始时间 = 当前时间 - 比例尺转换为秒
     * 2) 计算出起始时间下一段的整点的时间戳
     * 3) 计算出起始时间与开始时间的偏移量，并转成像素
     */
    this.axisStartTime = this.currentTime - this.settings.scale * 60 * 60 / 2
    this.axisEndTime = this.currentTime + this.settings.scale * 60 * 60 / 2
    const nextHourTime = Math.floor(getNextHour(this.axisStartTime * 1000) / 1000)
    const offsetX = (nextHourTime - this.axisStartTime) / this.settings.ratio
    // this.screen.axisStartTime = this.axisStartTime
    // this.screen.axisEndTime = this.axisEndTime
    // this.screen.scale = this.scale
    /* 计算小时刻度像素位置 */
    const hours = []
    const hourSpan = 60 * 60 / this.settings.ratio // 计算每小时间隔的像素值
    for (let i = -1; i <= this.settings.scale; i++) {
      let showText = true
      /* 根据密度控制文字的疏密度 */
      if ((this.settings.ratio > 100 && i % 2) || (this.settings.ratio > 240 && i % 4)) {
        showText = false
      }
      hours.push({
        x: Math.floor(i * hourSpan + offsetX - this.settings.hourWidth / 2), // 绘制时偏移刻度本身的宽度
        y: 0,
        showText
      })
    }
    this.axisData.hours = hours

    /* 计算半小时刻度像素位置 */
    const halfHours = []
    // const halfHourSpan = hourSpan / 2
    // if (halfHourSpan > this.settings.spanThreshold) {
    if (hourSpan) {
      for (let i = -2; i <= this.settings.scale; i++) {
        halfHours.push({
          x: Math.floor(i * hourSpan + hourSpan / 2 + offsetX - this.settings.halfHourWidth / 2), // 绘制时偏移刻度本身的宽度,
          y: 0
        })
      }
    }
    this.axisData.halfHours = halfHours

    /* 计算10分钟刻度像素位置 */
    const tenMins = []
    // const tenMinSpan = hourSpan / 6
    // if (tenMinSpan > this.settings.spanThreshold) {
    if (hourSpan > this.settings.width / 28) {
      for (let i = -6; i <= this.settings.scale * 6; i++) {
        if (!(i % 3)) continue // 将与半小时重复的线条排除
        tenMins.push({
          x: Math.floor(i * hourSpan / 6 + offsetX - this.settings.tenMinsWidth / 2), // 绘制时偏移刻度本身的宽度,
          y: 0
        })
      }
    }
    this.axisData.tenMins = tenMins

    /* 计算5分钟刻度像素位置 */
    const fiveMins = []
    // const fiveMinSpan = hourSpan / 12
    // if (fiveMinSpan > this.settings.spanThreshold) {
    if (hourSpan > this.settings.width / 9) {
      for (let i = -12; i <= this.settings.scale * 12; i++) {
        if (!(i % 2)) continue // 将与半小时重复的线条排除
        fiveMins.push({
          x: Math.floor(i * hourSpan / 12 + offsetX - this.settings.fiveMinsWidth / 2), // 绘制时偏移刻度本身的宽度,
          y: 0
        })
      }
    }
    this.axisData.fiveMins = fiveMins

    /* 计算1分钟刻度像素位置 */
    const oneMins = []
    // const oneMinSpan = hourSpan / 60
    // if (oneMinSpan > this.settings.spanThreshold) {
    if (hourSpan > this.settings.width / 5) {
      for (let i = -60; i <= this.settings.scale * 60; i++) {
        if (!(i % 5)) continue // 将与半小时重复的线条排除
        oneMins.push({
          x: Math.floor(i * hourSpan / 60 + offsetX - this.settings.oneMinWidth / 2), // 绘制时偏移刻度本身的宽度,
          y: 0
        })
      }
    }
    this.axisData.oneMins = oneMins

    /* 计算录像片段 */
    const records = []
    if (this.screen && this.screen.recordList) {
      for (let i = 0; i < this.screen.recordList.length; i++) {
        const record = this.screen.recordList[i]
        if (record.startTime < this.axisEndTime && record.endTime > this.axisStartTime) {
          const recordOffsetTime = record.startTime - this.axisStartTime
          records.push({
            x: Math.floor(recordOffsetTime / this.settings.ratio),
            y: 0,
            width: Math.ceil((record.endTime - record.startTime) / this.settings.ratio)
          })
        }
      }
    }
    this.axisData.records = records
  }

  /**
   * 计算画布大小
   */
  private calcSize() {
    const axisWrap = this.$refs.axisWrap as HTMLDivElement
    this.settings.width = axisWrap.clientWidth
    this.settings.height = axisWrap.clientHeight
    this.settings.ratio = this.settings.scale * 60 * 60 / axisWrap.clientWidth
    this.settings.hourSpan = axisWrap.clientWidth / this.settings.scale // 计算每小时间隔的像素值
    this.settings.hourHeight = this.settings.height - 20
    this.settings.halfHourHeight = 0.8 * this.settings.hourHeight
    this.settings.tenMinsHeight = 0.7 * this.settings.halfHourHeight
    this.settings.fiveMinsHeight = this.settings.tenMinsHeight
    this.settings.oneMinHeight = 0.6 * this.settings.fiveMinsHeight
    this.settings.recordHeight = this.settings.tenMinsHeight
  }

  /**
   * 初始化画布
   */
  private initCanvas() {
    this.canvas = this.$refs.canvas as HTMLCanvasElement
    this.canvas.addEventListener('mousedown', this.moveAxisStart)
    this.canvas.addEventListener('wheel', this.onWheel)
    this.canvas.width = this.settings.width
    this.canvas.height = this.settings.height
    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d')
      this.ctx.font = '11px arial'
      this.draw()
    }
  }

  /**
   * 重新计算大小并重绘
   */
  private resize() {
    this.calcSize()
    this.generateData()
    this.canvas.width = this.settings.width
    this.canvas.height = this.settings.height
    this.draw()
  }

  /**
   * 绘制时间轴
   */
  private draw() {
    this.ctx.clearRect(0, 0, this.settings.width, this.settings.height)
    const startTime = this.currentTime - this.settings.scale * 60 * 60 / 2 // 计算画布的起始时间

    /* 绘制录像线 */
    this.ctx.fillStyle = '#cfd9e7'
    for (let i in this.axisData.records) {
      const line = this.axisData.records[i]
      this.ctx.fillRect(line.x, line.y, line.width, this.settings.recordHeight)
    }

    /* 绘制小时线 */
    this.ctx.fillStyle = '#222'
    for (let i in this.axisData.hours) {
      const line = this.axisData.hours[i]
      this.ctx.fillRect(line.x, line.y, this.settings.hourWidth, this.settings.hourHeight)
      const timestamp = startTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
      const datetime = new Date(getNextHour(timestamp * 1000)) // 取整点并转换成Date对象
      line.showText && this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:00`, line.x - 13, this.settings.hourHeight + 15)
    }

    /* 绘制半小时线 */
    this.ctx.fillStyle = '#999'
    for (let i in this.axisData.halfHours) {
      const line = this.axisData.halfHours[i]
      this.ctx.fillRect(line.x, line.y, this.settings.halfHourWidth, this.settings.halfHourHeight)
      if (this.settings.scale < 9.5) {
        const timestamp = startTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
        const datetime = new Date(timestamp * 1000)
        this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:30`, line.x - 13, this.settings.hourHeight + 15)
      }
    }

    /* 绘制10分钟线 */
    for (let i in this.axisData.tenMins) {
      const line = this.axisData.tenMins[i]
      this.ctx.fillRect(line.x, line.y, this.settings.tenMinsWidth, this.settings.tenMinsHeight)
      if (this.settings.scale < (4 * 60 + 10) / 60) {
        const timestamp = startTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
        const datetime = new Date(timestamp * 1000)
        if ((datetime.getMinutes() + 1)) {
          // 剔除整点
          this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:${prefixZero(datetime.getMinutes() + 1, 2)}`, line.x - 13, this.settings.hourHeight + 15)
        }
      }
    }

    /* 绘制5分钟线 */
    for (let i in this.axisData.fiveMins) {
      const line = this.axisData.fiveMins[i]
      this.ctx.fillRect(line.x, line.y, this.settings.fiveMinsWidth, this.settings.fiveMinsHeight)
      if (this.settings.ratio < 4) {
        const timestamp = startTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
        const datetime = new Date(timestamp * 1000)
        if ((datetime.getMinutes() + 1) % 10) {
          // 剔除整十
          this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:${prefixZero(datetime.getMinutes() + 1, 2)}`, line.x - 13, this.settings.hourHeight + 15)
        }
      }
    }

    /* 绘制1分钟线 */
    for (let i in this.axisData.oneMins) {
      const line = this.axisData.oneMins[i]
      this.ctx.fillRect(line.x, line.y, this.settings.oneMinWidth, this.settings.oneMinHeight)
      if (this.settings.scale < 0.5) {
        const timestamp = startTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
        const datetime = new Date(timestamp * 1000)
        if ((datetime.getMinutes() + 1) % 5) {
          // 剔除整十
          this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:${prefixZero(datetime.getMinutes() + 1, 2)}`, line.x - 13, this.settings.hourHeight + 15)
        }
      }
    }
  }

  /**
   * 开始拖拽时间轴
   */
  private moveAxisStart(e: MouseEvent) {
    this.axisDrag.isDragging = true
    this.axisDrag.startX = e.x
    window.addEventListener('mousemove', this.onAxisMove)
    window.addEventListener('mouseup', this.onAxisMouseup)
  }

  /**
   * 拖拽时间轴时移动鼠标
   */
  private onAxisMove(e: MouseEvent) {
    if (!this.axisDrag.isDragging) return
    this.axisDrag.deltaX = this.axisDrag.startX - e.x
    this.axisDrag.startX = e.x
    this.currentTime = Math.floor(this.currentTime + this.axisDrag.deltaX * this.settings.ratio) // 将偏移像素值转换成时间戳
    this.generateData()
    this.draw()
  }

  /**
   * 拖拽时间轴后抬起鼠标
   */
  private onAxisMouseup() {
    window.removeEventListener('mousemove', this.onAxisMove)
    window.removeEventListener('mouseup', this.onAxisMouseup)
    this.axisDrag.isDragging = false
    this.$emit('change', this.currentTime, this.loadingSeeker())
  }

  /**
   * 键盘热键
   */
  private onHotkey(e: KeyboardEvent) {
    if (!this.currentTime) return
    switch (e.code) {
      case 'ArrowRight':
        this.currentTime = this.currentTime + 1
        this.$emit('change', this.currentTime, this.loadingSeeker())
        break
      case 'ArrowLeft':
        this.currentTime = this.currentTime - 1
        this.$emit('change', this.currentTime, this.loadingSeeker())
        break
    }
  }

  /**
   * 滚动鼠标滑轮
   */
  private onWheel(e: WheelEvent) {
    if (e.deltaY > 0) {
      this.zoom(0)
    } else {
      this.zoom(1)
    }
  }

  /**
   * 缩放时间轴
   * 0: 缩小
   * 1: 放大
   */
  private zoom(type) {
    if (type === 1 && this.settings.scale > 0.1) {
      this.settings.scale = this.settings.scale * 0.9
      this.resize()
    } else if (type === 0 && this.settings.scale < 24) {
      this.settings.scale = this.settings.scale * 1.1
      this.resize()
    }
  }

  /**
   * loadingSeeker
   * 判断当前时刻下是否需要加载前后一天的视频
   */
  public loadingSeeker() {
    let thresholdStart = 0.5 * this.settings.scale * 60 * 60 // 单位 s
    let thresholdEnd = 24 * 60 * 60 - 0.5 * this.settings.scale * 60 * 60
    let deltaCurrentTime = currentTimeZeroMsec(this.currentTime * 1000) / 1000
    if (thresholdEnd < deltaCurrentTime) {
      return '加载后一天🚆'
    } else if (thresholdStart > deltaCurrentTime) {
      return '加载前一天✈'
    } else {
      return '不需要加载新的视频'
    }
  }
}
</script>
<style lang="scss" scoped>
.axis {
  &__wrap {
    position: relative;
    width: 100%;
    height: 50px;
  }

  &__canvas {
    width: 100%;
    cursor: grab;

    &.dragging {
      cursor: grabbing;
    }
  }

  &__middle {
    position: absolute;
    width: 3px;
    height: 30px;
    left: 50%;
    top: -5px;
    margin-left: -1px;
    background: $primary;
  }

  &__time {
    position: absolute;
    top: -20px;
    left: 50%;
    margin-left: -100px;
    width: 200px;
    text-align: center;
    color: $primary;
    font-size: 12px;
    font-weight: bold;
    user-select: none;
  }

  &__zoom {
    text-align: right;

    &__btn {
      display: inline-block;
      padding: 4px;
      cursor: pointer;
    }
  }
}

</style>
