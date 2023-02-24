<template>
  <div ref="axisWrap" class="axis__wrap" :class="{'axis__wrap--disabled': disabled}">
    <div class="axis__middle" />
    <div class="axis__border" />
    <div v-if="!hasAxis">
      <div v-if="!editTime" class="axis__time" @click="enableEditTime">
        <el-tooltip placement="right" content="编辑时间" :disabled="disabled">
          <span class="axis__span" :class="{'axis__time__btn': !disabled}">{{ formatedCurrentTime }}</span>
        </el-tooltip>
      </div>
      <TimeEditer v-else :screen="screen" :current-time="currentTime" @change="onTimeEditerChange" @close="onCloseTimeEditer" />
    </div>
    <div v-else class="axis__time">
      <span class="axis__span">{{ formatedCurrentTime }}</span>
    </div>
    <canvas ref="canvas" class="axis__canvas" :class="{'dragging': axisDrag.isDragging}" />
    <div class="axis__zoom">
      <div class="axis__zoom__btn" @click="zoom(1)"><svg-icon name="zoom-in" width="12" /></div>
      <div class="axis__zoom__btn" @click="zoom(0)"><svg-icon name="zoom-out" width="12" /></div>
    </div>
    <img id="lock" style="display: none;" src="@/assets/images/lock.png">
    <div v-if="tipVisiable" :style="dynamicPos" id="unlockTip" @mouseleave="tooltipHider">
      <span
      v-for="item, index in durationList"
      :key="index"
      class="lock-tooltip"
      >
      已锁定: {{ item.lockStartTime }} - {{ item.lockEndTime }}
      <span class="lock-tooltip-unlock" v-if="canLock && !isDialogTask" @click="unlock(item)">解锁</span>
      </span>
      <div class="extend-hover"></div>
    </div>
    <UnlockDialog v-if="unlockVisable" :screen="screen" :duration="unlockDuration" :unlock-item="recordLockItem" @on-close="closeUnlock" :multiple="false" />
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
import { isCrossDays, dateFormat, getNextHour, getDateByTime, currentTimeZeroMsec } from '@/utils/date'
import { prefixZero } from '@/utils/number'
import { time24Format } from '@/utils/date'
import { Screen } from '@/views/device/services/Screen/Screen'
import { throttle } from 'lodash'
import TimeEditer from '@/views/device/components/ReplayPlayer/TimeEditer.vue'
import ResizeObserver from 'resize-observer-polyfill'
import { UserModule } from '@/store/modules/user'
import UnlockDialog from '@/views/device/components/dialogs/Unlock.vue'

@Component({
  name: 'ReplayAxis',
  components: {
    TimeEditer,
    UnlockDialog
  }
})
export default class extends Vue {
  /* 时间是否可编辑 */
  @Prop()
  private hasAxis: boolean
  /* 当前分屏 */
  @Prop()
  private screen: Screen

  /* 是否为内嵌模式 */
  @Prop({
    default: false
  })
  private isInline: boolean

  /* 是否禁用 */
  @Prop({
    default: false
  })
  private disabled: boolean

  /* 是否是dialog窗口 */
  @Prop()
  private isDialogTask: boolean

  private canLock = false

  /* 锁定权限 */ 
  // private lockPermission: any = 1

  /* 时间轴拖动数据 */
  private axisDrag: any = {
    isDragging: false,
    deltaX: 0,
    startX: 0,
    startTime: -1,
    endTime: -1
  }

  // private UserModule = UserModule

  /* 时间轴设置 */
  private settings = {
    width: 0,
    height: 0,
    scale: 24, // 缩放比例，画布显示的小时数量
    ratio: 0, // 比例尺(秒/每像素)
    hourWidth: 1,
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
    minLineWidth: 0,
    minLineHeight: 0,
    spanThreshold: 10,
    hourSpan: null,
    y: 0,
    textY: 0,
    midLineY: 0,
    recordColor: '#abd0ff',
    heatmapColor: '#d94f4f',
    hourLineColor: '#000',
    minLineColor: '#94a4ba',
    midLineColor: '#fa8334',
    gradientColor: '255, 255, 255'
  }

  /* 刻度数据 */
  private axisData = {
    hours: [],
    halfHours: [],
    tenMins: [],
    fiveMins: [],
    oneMins: [],
    records: [],
    heatmaps: [],
    locks: []
  }

  /* 画布 */
  private canvas: HTMLCanvasElement = null
  /* 画布上下文 */
  private ctx: CanvasRenderingContext2D = null
  /* 尺寸监听器 */
  private resizeObserver: ResizeObserver = null
  /* 当前时间 */
  public currentTime: number = getDateByTime(new Date().getTime()) / 1000
  /* 最后一次更新currentTime的时间，用于截流 */
  private lastUpdateTime = 0
  /* 当前时间轴的头部时间 */
  private axisStartTime: number = 0
  /* 当前时间轴的末尾时间 */
  private axisEndTime: number = 0
  /* 是否加载中 */
  private isLoading = false
  /* 延时加载相邻日期定时器 */
  private timeout = null
  /* 是否编辑时间轴时间 */
  private editTime = false
  /* 是否是点击事件而不是拖拽 */
  private notClick = false
  /* 是否生成对应 index 的 tooltip */
  private tipVisiable = false
  /* 合并锁的间隔阈值 px */
  private pixelThreshold = 30
/* hover time display , start & end */
  private duration = {
    'lockStartTime': null,
    'lockEndTime': null
  }
  /* 合并锁 */
  private durationList = [] 
  private unlockDuration = {
    'lockStartTime': null,
    'lockEndTime': null
  }
  /* tooltip 样式 */
  private dynamicPos = {
    'position': 'relative',
    'padding': '5px',
    'border': '1px solid #d7d7d7',
    'width': '300px',
    // 'height': '100%',
    'display': 'block',
    'left': '',
    // 'top': '-95px',
    'max-height': '77px',
    'top': '',
    'font-size': '12px',
    'text-align': 'center',
    'border-radius': '6px',
    'background-color': 'white',
    'overflow': 'auto',
    'z-index': '99'
  }
  /* 增大tooltip 感应范围 */
  private extendHover = {
    'position': 'relative',
    // 'padding': '5px',
    // 'border': '1px solid #d7d7d7',
    'width': '300px',
    // 'height': '100%',
    'display': 'block',
    'left': '',
    // 'top': '-95px',
    // 'max-height': '77px',
    'height': '10px',
    // 'top': '',
    // 'font-size': '12px',
    // 'text-align': 'center',
    // 'border-radius': '6px',
    'background-color': 'red',
    // 'overflow': 'auto',
    'z-index': '99'
  }
  /* unlock dialog visiable */
  private unlockVisable = false
  /* current clicked locked item */
  private recordLockItem = null

  /* 当前分屏的录像管理器 */
  private get recordManager() {
    return this.screen && this.screen.recordManager
  }

  /* 格式化当前时间 */
  private get formatedCurrentTime() {
    return this.screen && this.screen.isLoading ? '加载中' : dateFormat(this.currentTime * 1000)
  }

  /* 监听播放器时间变化 */
  @Watch('screen.player.currentTime')
  private onCurrentTimeChange() {
    if (this.screen.isLive || this.disabled || this.axisDrag.isDragging) return
    /* 如果与上一次的更新时间差小于1秒，不触发绘制 */
    if (new Date().getTime() - this.lastUpdateTime < 1000) return
    if (this.screen && this.screen.player && this.screen.player.currentTime) {
      const recordCurrentTime = this.screen.player.currentTime
      if (this.screen.recordType === 0 && this.recordManager.currentRecord) {
        const offsetTime = this.recordManager.currentRecord.offsetTime || 0
        const duration = offsetTime > recordCurrentTime ? offsetTime : recordCurrentTime
        this.currentTime = this.recordManager.currentRecord.startTime + duration
      } else if (this.screen.recordType === 1) {
        this.currentTime = this.recordManager.localStartTime + recordCurrentTime
      }
      this.lastUpdateTime = new Date().getTime()
      this.screen.currentRecordDatetime = this.currentTime
      this.generateData()
      this.draw()
      this.loadSiblingRecordList(-1, -1)
    }
  }

  /* 监听设备变化 */
  @Watch('screen.deviceId')
  /* 监听锁定权限变化 */
  @Watch('screen.ivsLockCloudRecord')
  /* 监听录像类型变化 */
  @Watch('screen.recordType')
  /* 监听录像列表 */
  @Watch('recordManager.recordList')
  /* 监听录像锁列表 */
  @Watch('recordManager.lockList')
  /* 监听日历变化 */
  @Watch('recordManager.currentDate', { immediate: true })
  private onStatusChange() {
    // console.log('时间轴上可以看到  不 recordType 变了 后端控制 查到为空就行？  🧨✨🎉', this.screen.inProtocol, this.screen.recordType)
    // if (this.screen.inProtocol === 'gb28181' && this.screen.recordType === 1) {
    //   // 设备不存在录像锁定功能

    // }
    // 更新锁定权限，控制锁定功能
    if ((!UserModule.iamUserId || this.screen.ivsLockCloudRecord) && !this.isDialogTask) {
      // can lock
      this.canLock = true
      this.canvas && this.canvas.addEventListener('click', this.onClickLock)
      // console.log('🎈🎈🎈🎈 注册点击锁事件 this.canLock', this.canLock)
    } else {
      this.canLock = false
      this.canvas && this.canvas.removeEventListener('click', this.onClickLock)
      // console.log('🧨🎇🧨 删除点击锁事件')
    }
    this.currentTime = this.screen.currentRecordDatetime || (this.recordManager && this.recordManager.currentDate) || getDateByTime(new Date().getTime()) / 1000
    this.generateData()
    this.draw()
    if (this.screen.isLive || this.disabled) return
    /* 继续加载上一天的录像列表 */
    clearTimeout(this.timeout)
    this.timeout = setTimeout(async() => {
      await this.loadSiblingRecordList(-1, -1)
      setTimeout(() => {
        this.generateData()
        this.draw()
      }, 100)
    }, 1000)
  }

  private created() {
    if (this.isInline) {
      this.settings.recordColor = '#445469'
      this.settings.heatmapColor = '#8d4b4b'
      this.settings.hourLineColor = '#bbb'
      this.settings.minLineColor = '#999'
      this.settings.midLineColor = '#fa8334'
      this.settings.spanThreshold = 15
      this.settings.hourWidth = 1
      this.settings.gradientColor = '0, 0, 0'
    }
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
    this.canvas.removeEventListener('click', this.onClickLock)
    this.canvas.removeEventListener('mousemove', this.onAxisMove)
    window.removeEventListener('keydown', this.onHotkey)
    // document.getElementById('unlockTip') && document.getElementById('unlockTip').removeEventListener('mouseleave', this.tooltipHider)
    if (this.resizeObserver) this.resizeObserver.disconnect()
  }

  /**
   * 初始化画布
   */
  private initCanvas() {
    this.canvas = this.$refs.canvas as HTMLCanvasElement
    this.canvas.addEventListener('mousedown', this.moveAxisStart)
    this.canvas.addEventListener('wheel', this.onWheel)
    // 没有锁定权限、dialog录像窗口，不用注册点击锁方法
    if (this.canLock && !this.isDialogTask) {
      this.canvas.addEventListener('click', this.onClickLock)
    }
    this.canvas.addEventListener('mousemove', this.onAxisMove)
    this.canvas.width = this.settings.width
    this.canvas.height = this.settings.height
    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d')
      this.ctx.font = '11.5px arial'
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
   * 计算画布大小
   */
  private calcSize() {
    const axisWrap = this.$refs.axisWrap as HTMLDivElement
    this.settings.width = axisWrap.clientWidth
    this.settings.height = axisWrap.clientHeight - 22
    this.settings.ratio = this.settings.scale * 60 * 60 / axisWrap.clientWidth
    this.settings.hourSpan = axisWrap.clientWidth / this.settings.scale // 计算每小时间隔的像素值
    this.settings.hourHeight = this.settings.height - (this.isInline ? 16 : 18)
    this.settings.halfHourHeight = 0.8 * this.settings.hourHeight
    this.settings.tenMinsHeight = 0.7 * this.settings.halfHourHeight
    this.settings.fiveMinsHeight = this.settings.tenMinsHeight
    this.settings.oneMinHeight = 0.6 * this.settings.fiveMinsHeight
    this.settings.recordHeight = this.isInline ? this.settings.hourHeight : this.settings.tenMinsHeight
    this.settings.minLineWidth = this.isInline ? 2 : 3
    this.settings.minLineHeight = this.isInline ? this.settings.hourHeight + 25 : this.settings.hourHeight + 5
    this.settings.textY = this.isInline ? this.settings.hourHeight + 14 : this.settings.hourHeight + 18
    this.settings.y = this.isInline ? 0 : 5
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
    this.axisStartTime = this.currentTime - this.settings.scale * 60 * 60 / 2 // 计算画布的起始时间
    this.axisEndTime = this.currentTime + this.settings.scale * 60 * 60 / 2 // 计算画布的结束时间
    const nextHourTime = Math.floor(getNextHour(this.axisStartTime * 1000) / 1000)
    const offsetX = (nextHourTime - this.axisStartTime) / this.settings.ratio
    /* 计算小时刻度像素位置 */
    const hours = []
    const hourSpan = 60 * 60 / this.settings.ratio // 计算每小时间隔的像素值
    for (let i = -1; i <= this.settings.scale; i++) {
      const x = Math.floor(i * hourSpan + offsetX - this.settings.hourWidth / 2) // 绘制时偏移刻度本身的宽度
      /* 根据密度控制文字的疏密度 */
      let showText = true
      const timestamp = this.axisStartTime + x * this.settings.ratio // 计算当前line对象的实际时间戳
      const hour = new Date(getNextHour(timestamp * 1000)).getHours() // 取整点并转换成Date对象
      if ((this.settings.ratio > 100 && hour % 2) || (this.settings.ratio > 240 && hour % 4) || (this.settings.ratio > 480 && hour % 8)) {
        showText = false
      }
      hours.push({
        x,
        y: this.settings.y,
        showText
      })
    }
    this.axisData.hours = hours

    /* 计算半小时刻度像素位置 */
    const halfHours = []
    if (hourSpan) {
      for (let i = -2; i <= this.settings.scale; i++) {
        halfHours.push({
          x: Math.floor(i * hourSpan + hourSpan / 2 + offsetX - this.settings.halfHourWidth / 2), // 绘制时偏移刻度本身的宽度,
          y: this.settings.y
        })
      }
    }
    this.axisData.halfHours = halfHours

    /* 计算10分钟刻度像素位置 */
    const tenMins = []
    if (hourSpan > this.settings.width / 28) {
      for (let i = -6; i <= this.settings.scale * 6; i++) {
        if (!(i % 3)) continue // 将与半小时重复的线条排除
        tenMins.push({
          x: Math.floor(i * hourSpan / 6 + offsetX - this.settings.tenMinsWidth / 2), // 绘制时偏移刻度本身的宽度,
          y: this.settings.y
        })
      }
    }
    this.axisData.tenMins = tenMins

    /* 计算5分钟刻度像素位置 */
    const fiveMins = []
    if (hourSpan > this.settings.width / 9) {
      for (let i = -12; i <= this.settings.scale * 12; i++) {
        if (!(i % 2)) continue // 将与半小时重复的线条排除
        fiveMins.push({
          x: Math.floor(i * hourSpan / 12 + offsetX - this.settings.fiveMinsWidth / 2), // 绘制时偏移刻度本身的宽度,
          y: this.settings.y
        })
      }
    }
    this.axisData.fiveMins = fiveMins

    /* 计算1分钟刻度像素位置 */
    const oneMins = []
    if (hourSpan > this.settings.width / 5) {
      for (let i = -60; i <= this.settings.scale * 60; i++) {
        if (!(i % 5)) continue // 将与半小时重复的线条排除
        oneMins.push({
          x: Math.floor(i * hourSpan / 60 + offsetX - this.settings.oneMinWidth / 2), // 绘制时偏移刻度本身的宽度,
          y: this.settings.y
        })
      }
    }
    this.axisData.oneMins = oneMins

    /* 计算片段 */
    const calRecords = (list) => {
      const records = []
      for (let i = 0; i < list.length; i++) {
        const record = list[i]
        if (record.startTime < this.axisEndTime && record.endTime > this.axisStartTime) {
          const recordOffsetTime = record.startTime - this.axisStartTime
          records.push({
            x: Math.floor(recordOffsetTime / this.settings.ratio),
            y: this.settings.y,
            width: Math.ceil((record.endTime - record.startTime) / this.settings.ratio)
          })
        }
      }
      return records
    }
    /* 计算录像片段 */
    this.axisData.records = this.recordManager && this.recordManager.recordList ? calRecords(this.recordManager.recordList) : []
    /* 计算Heatmap片段 */
    this.axisData.heatmaps = this.recordManager && this.recordManager.heatmapList ? calRecords(this.recordManager.heatmapList) : []

    /* 计算锁的位置 */
    const calLocks = (list) => {
      const locks = []
      const allPointsLocks = []
      let joinLocks:any = []
      for (let i = 0; i < list.length; i++) {
        const record = list[i]
        allPointsLocks.push({
          time: record.startTime,
          lockCollection: [],
          ...record
        }, {
          time: record.endTime,
          lockCollection: [],
          ...record
        })
      }
      joinLocks = this.joinLock(allPointsLocks)
      for (let i = 0; i < joinLocks.length; i++) {
        const record = joinLocks[i]
        if (record.startTime < this.axisEndTime && record.endTime > this.axisStartTime) {
          // const lockOffsetTime = record.startTime - this.axisStartTime
          const lockOffsetTime = record.time - this.axisStartTime
          locks.push({
            x: Math.floor(lockOffsetTime / this.settings.ratio),
            // startTime: record.startTime,
            // endTime: record.endTime,
            // recordLockId: record.recordLockId,
            // exp_time:,
            // origin_exp_time:,
            // deviceName:,
            // deviceId:
            ...record
          })
        }
      }
      return locks
    }
    /* 已锁定的录像片段区间起始位置 */
    this.axisData.locks = this.recordManager && this.recordManager.lockList.length ? calLocks(this.recordManager.lockList) : []
    // 国标下，切换到设备时，去掉锁
    if (this.screen.inProtocol === 'gb28181' && this.screen.recordType === 1) {
      this.axisData.locks = []
    }
    // this.axisData.locks = this.recordManager && this.recordManager.lockList.length ? calLocks(this.recordManager.lockList) : calLocks(this.testLockList) // 测试用
    // this.axixData.locks = [{ x: 50 }]
  }

  private joinLock(lockList: any,anchorIndex: number = 0, joinedLockList?: any) {
    let locks: any = joinedLockList ? joinedLockList : null
    for (let i = anchorIndex; i < lockList.length - 1; i++) {
      const anchorLock = lockList[i]
      locks = joinedLockList ? joinedLockList : [{
        ...anchorLock
      }]
      for (let o = i + 1; o < lockList.length; o++) {
        const nextLock = lockList[o]
        const deltaTime = nextLock.time - anchorLock.time
        const pixelGap = deltaTime / this.settings.ratio
        if (pixelGap < this.pixelThreshold) {
          // 合并
          const len = locks.length
          locks[len - 1]['lockCollection'].push(nextLock)
        } else {
          locks.push(nextLock)
          return this.joinLock(lockList, o, locks)
        }
      }
    }
    return locks
  }


  /**
   * 绘制时间轴
   */
  private draw() {
    if (!this.ctx) return
    this.ctx.clearRect(0, 0, this.settings.width, this.settings.height)

    /* 绘制录像线 */
    this.ctx.fillStyle = this.settings.recordColor
    for (let i in this.axisData.records) {
      const line = this.axisData.records[i]
      this.ctx.fillRect(line.x, line.y, line.width, this.settings.recordHeight)
    }

    /* 绘制heatmap线 */
    this.ctx.fillStyle = this.settings.heatmapColor
    for (let i in this.axisData.heatmaps) {
      const line = this.axisData.heatmaps[i]
      this.ctx.fillRect(line.x, line.y, line.width, this.settings.recordHeight)
    }

    /* 绘制小时线 */
    this.ctx.fillStyle = this.settings.hourLineColor
    for (let i in this.axisData.hours) {
      const line = this.axisData.hours[i]
      this.ctx.fillRect(line.x, line.y, this.settings.hourWidth, this.settings.hourHeight)
      const timestamp = this.axisStartTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
      const datetime = new Date(getNextHour(timestamp * 1000)) // 取整点并转换成Date对象
      line.showText && this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:00`, line.x - 13, this.settings.textY)
    }

    /* 绘制半小时线 */
    this.ctx.fillStyle = this.settings.minLineColor
    for (let i in this.axisData.halfHours) {
      const line = this.axisData.halfHours[i]
      this.ctx.fillRect(line.x, line.y, this.settings.halfHourWidth, this.settings.halfHourHeight)
      if (this.settings.hourSpan > 70) {
        const timestamp = this.axisStartTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
        const datetime = new Date(timestamp * 1000)
        this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:30`, line.x - 13, this.settings.textY)
      }
    }

    /* 绘制10分钟线 */
    for (let i in this.axisData.tenMins) {
      const line = this.axisData.tenMins[i]
      if (this.settings.ratio < 150) { this.ctx.fillRect(line.x, line.y, this.settings.tenMinsWidth, this.settings.tenMinsHeight) }
      if (this.settings.hourSpan > 196) {
        const timestamp = this.axisStartTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
        const datetime = new Date(timestamp * 1000)
        if ((datetime.getMinutes() + 1)) {
          // 剔除整点
          this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:${prefixZero(datetime.getMinutes() + 1, 2)}`, line.x - 13, this.settings.textY)
        }
      }
    }

    /* 绘制5分钟线 */
    for (let i in this.axisData.fiveMins) {
      const line = this.axisData.fiveMins[i]
      if (this.settings.ratio < 70) { this.ctx.fillRect(line.x, line.y, this.settings.fiveMinsWidth, this.settings.fiveMinsHeight) }
      if (this.settings.hourSpan > 673) {
        const timestamp = this.axisStartTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
        const datetime = new Date(timestamp * 1000)
        if ((datetime.getMinutes() + 1) % 10) {
          // 剔除整十
          this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:${prefixZero(datetime.getMinutes() + 1, 2)}`, line.x - 13, this.settings.textY)
        }
      }
    }

    /* 绘制1分钟线 */
    for (let i in this.axisData.oneMins) {
      const line = this.axisData.oneMins[i]
      if (this.settings.ratio < 15) { this.ctx.fillRect(line.x, line.y, this.settings.oneMinWidth, this.settings.oneMinHeight) }
      if (this.settings.hourSpan > 2200) {
        const timestamp = this.axisStartTime + line.x * this.settings.ratio // 计算当前line对象的实际时间戳
        const datetime = new Date(timestamp * 1000)
        if ((datetime.getMinutes() + 1) % 5) {
          // 剔除整十
          this.ctx.fillText(`${prefixZero(datetime.getHours(), 2)}:${prefixZero(datetime.getMinutes() + 1, 2)}`, line.x - 13, this.settings.textY)
        }
      }
    }

    /* 中心线 */
    this.ctx.fillStyle = this.settings.midLineColor
    this.ctx.fillRect(Math.floor(this.settings.width / 2 - 1), 0, this.settings.minLineWidth, this.settings.minLineHeight)

    // this.axisData.locks = [{ x: 50 }, { x: 500 }, { x: 600 }]
    /* 绘制录像锁 */
    for (let i in this.axisData.locks) {
      const position = this.axisData.locks[i]
      const img: any = document.getElementById('lock')
      this.ctx.drawImage(img, position.x, 0, 12, 12)
    }

    /* 绘制左右渐变 */
    // if (!this.isInline) {
    //   const gradientWidth = this.settings.width * 0.08
    //   const startColor = `rgba(${this.settings.gradientColor}, 0.7)`
    //   const endColor = `rgba(${this.settings.gradientColor}, 0)`
    //   /* 左侧 */
    //   const gradientL = this.ctx.createLinearGradient(0, 0, gradientWidth, 0)
    //   gradientL.addColorStop(0, startColor)
    //   gradientL.addColorStop(1, endColor)
    //   this.ctx.fillStyle = gradientL
    //   this.ctx.fillRect(0, 0, gradientWidth, this.settings.height)
    //   /* 右侧 */
    //   const gradientR = this.ctx.createLinearGradient(this.settings.width - gradientWidth, 0, this.settings.width, 0)
    //   gradientR.addColorStop(0, endColor)
    //   gradientR.addColorStop(1, startColor)
    //   this.ctx.fillStyle = gradientR
    //   this.ctx.fillRect(this.settings.width - gradientWidth, 0, gradientWidth, this.settings.height)
    // }
  }

  // 绘制对应的 tooltip
  private drawTooltip(lock: any) {
    // 传参输入 对应锁的坐标
    // 合并锁，点击无效果，只显示tool tips，通过tool tips进行解锁选择
    this.$nextTick(() => {
      // 去除重复的开始锁和结束锁
      let map = new Map()
      const lockmap = []
      if (lock.lockCollection.length > 0) {
        for (let item of lock.lockCollection) {
          if (!map.has(item.startTime) && !map.has(item.endTime)) {
            map.set(item.startTime, item)
            lockmap.push(item)
          }
        }
      }
      lock.lockCollection = lockmap
      const subLocks = lock.lockCollection
      // 检查第一个和第零个元素是否属于同一个录像片段
      if (subLocks.length > 0 && lock.startTime === subLocks[0].startTime && lock.endTime === subLocks[0].endTime) {
        subLocks.shift()
      }
      this.durationList = [{
        lockStartTime: time24Format(lock.startTime * 1000),
        // lockStartTime: (new Date(lock.startTime * 1000)).toLocaleTimeString(),
        // lockEndTime: (new Date(lock.endTime * 1000)).toLocaleTimeString(),
        lockEndTime: time24Format(lock.endTime * 1000, true),
        deviceId: lock.deviceId,
        deviceName: lock.deviceName,
        anchorTime: lock.time,
        startTime: lock.startTime,
        endTime: lock.endTime
      }]
      // this.dynamicPos.left = this.settings.width - lock.x <= 250 ? lock.x - 200 + 'px' : lock.x + 'px'
      if (lock.lockCollection.length > 0) {
        this.durationList.push(subLocks.map((item: any) => {
          if (lock.startTime !== item.startTime && lock.endTime !== item.endTime) {
            return {
              // lockStartTime: (new Date(item.startTime * 1000)).toLocaleTimeString(),
              lockStartTime: time24Format(item.startTime * 1000),
              // lockEndTime: (new Date(item.endTime * 1000)).toLocaleTimeString(),
              lockEndTime: time24Format(lock.endTime * 1000, true),
              deviceId: item.deviceId,
              deviceName: item.deviceName,
              startTime: lock.startTime,
              endTime: lock.endTime,
              anchorTime: item.time
            }
          }
        }))
        this.dynamicPos.top = subLocks.length > 1 ? '-148px' : '-126px'
      } else {
        this.dynamicPos.top = '-104px'
      }
      // this.dynamicPos.left = this.settings.width - lock.x <= 250 ? lock.x - 200 + 'px' : lock.x + 'px'
      this.dynamicPos.left = this.settings.width - lock.x <= 320 ? lock.x - 280 + 'px' : lock.x + 'px'
      this.durationList = this.durationList.flat()
      // else {
      //   this.duration.lockStartTime = (new Date(lock.startTime * 1000)).toLocaleTimeString() // fake
      //   this.duration.lockEndTime = (new Date(lock.endTime * 1000)).toLocaleTimeString() // fake
      //   // this.unlockDuration.lockStartTime = (new Date(lock.startTime * 1000)).toLocaleString() // fake
      //   // this.unlockDuration.lockEndTime = (new Date(lock.endTime * 1000)).toLocaleString() // fake
      //   // this.tipVisiable = true
      // }
    })
  }
  
  /**
   *  点击锁，解绑
   * 多个锁合并的情况，不弹出解锁页面，点击锁本身无效果
   * 
   */
  private onClickLock(e: any) {
    if (!this.notClick) {
      if (this.durationList.length > 1) return
      this.axisData.locks.map((item: any) => {
        const validX = item.x + 20
        const validY = 20
        if (e.offsetX >= item.x && e.offsetX <= validX && e.offsetY >= 0 && e.offsetY <= validY) {
          this.recordLockItem = [item]
          this.unlockVisable = true
        }
      })
    }
  }

  private unlock(item: any) {
    // if (this.lockPermission !== 1) return
    this.recordLockItem = [item]
    this.unlockVisable = true
  }

  /**
   * 开始拖拽时间轴
   */
  private moveAxisStart(e: MouseEvent) {
    e.stopPropagation()
    this.notClick = false
    this.axisDrag.isDragging = true
    this.axisDrag.startX = e.x
    this.axisDrag.startTime = this.currentTime
    // window.addEventListener('mousemove', this.onAxisMove)
    window.addEventListener('mouseup', this.onAxisMouseup)
  }

  /**
   * 移动鼠标或拖拽时间轴时移动鼠标
   */
  // private onAxisMove(e: MouseEvent) {
  //   if (!this.axisDrag.isDragging) return
  //   this.axisDrag.deltaX = this.axisDrag.startX - e.x
  //   this.axisDrag.startX = e.x
  //   this.currentTime = this.currentTime + this.axisDrag.deltaX * this.settings.ratio // 将偏移像素值转换成时间戳
  //   this.generateData()
  //   this.draw()
  // }
  private onAxisMove(e: MouseEvent) {
    // 非拖拽，移动到锁位置，显示提示
    // 显示锁定提示的时候点住锁位置并拖动，始终跟随拖动位置显示提示和锁位置
    this.axisData.locks.map((item: any) => {
      const validX = item.x + 20
      const validY = 20
      if (e.offsetX >= item.x && e.offsetX <= validX && e.offsetY >= 0 && e.offsetY <= validY) {
        this.$nextTick(() => {
          this.tipVisiable = true
          this.drawTooltip(item)
          // document.getElementById('unlockTip').addEventListener('mouseleave', this.tooltipHider)
        })
      } else {
        // document.getElementById('unlockTip') && document.getElementById('unlockTip').removeEventListener('mouseleave', this.tooltipHider)
        this.tipVisiable = false
      }
    })
    if (this.axisDrag.isDragging) {
      this.notClick = true
      this.axisDrag.deltaX = this.axisDrag.startX - e.x
      this.axisDrag.startX = e.x
      this.currentTime = this.currentTime + this.axisDrag.deltaX * this.settings.ratio // 将偏移像素值转换成时间戳
    }
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
    this.axisDrag.endTime = this.currentTime
    this.$emit('change', this.currentTime)
    this.$nextTick(() => {
      this.loadSiblingRecordList(this.axisDrag.startTime, this.axisDrag.endTime)
    })
  }

  /**
   * 键盘热键
   */
  private onHotkey(e: KeyboardEvent) {
    if (!this.currentTime) return
    switch (e.code) {
      case 'ArrowRight':
        this.currentTime = this.currentTime + 1
        this.$emit('change', this.currentTime)
        this.$nextTick(() => {
          this.loadSiblingRecordList(this.currentTime, this.currentTime + 1)
        })
        break
      case 'ArrowLeft':
        this.currentTime = this.currentTime - 1
        this.$emit('change', this.currentTime)
        this.$nextTick(() => {
          this.loadSiblingRecordList(this.currentTime, this.currentTime - 1)
        })
        break
    }
  }

  /**
   * 滚动鼠标滑轮
   */
  private onWheel(e: WheelEvent) {
    e.stopPropagation()
    e.preventDefault()
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
   * 加载临近天的录像列表
   * 判断当前时刻下是否需要加载前后一天的视频
   */
  public async loadSiblingRecordList(moveStartTime: number, moveEndTime: number) {
    if (this.isLoading) return
    try {
      this.isLoading = true
      if (!isCrossDays(moveStartTime * 1000, moveEndTime * 1000)) {
        const thresholdStart = 0.5 * this.settings.scale * 60 * 60
        const thresholdEnd = 24 * 60 * 60 - 0.5 * this.settings.scale * 60 * 60
        const deltaCurrentTime = currentTimeZeroMsec(this.currentTime * 1000) / 1000
        let date
        if (thresholdEnd < deltaCurrentTime) {
          date = getDateByTime(this.currentTime, 's') + 24 * 60 * 60
          await this.getRecordListByDate(date)
        } else if (thresholdStart > deltaCurrentTime) {
          date = getDateByTime(this.currentTime, 's') - 24 * 60 * 60
          await this.getRecordListByDate(date)
        }
      }
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 根据日期加载录像列表
   * @param date 日期(时间戳/秒)
   */
  private async getRecordListByDate(date) {
    if (this.screen && this.screen.recordManager) {
      await this.screen.recordManager.getRecordListByDate(date, true)
    }
  }

  /* 显示编辑时间及添加页面点击监听 */
  private enableEditTime() {
    if (this.screen.isLoading || this.disabled) return
    this.editTime = true
  }

  // 关闭时间编辑器
  private onCloseTimeEditer() {
    this.editTime = false
  }

  /* 当时间编辑器的时间改变 */
  private onTimeEditerChange(time: number) {
    this.currentTime = time
    this.$emit('change', time)
    this.generateData()
    this.draw()
  }

  // 关闭解锁 dialog
  private async closeUnlock(isUnlocked?: boolean) {
    try {
      // 如果是锁定录像管理页面查看并解锁，则向上抛出关闭录像dialog的事件
      this.tipVisiable = false //关闭tool tips
      if (isUnlocked) {
        const date = getDateByTime(this.currentTime, 's')
        await this.screen.recordManager.getRecordListByDate(date, false, true) // 重新加载 lock list  
      }
    } catch (e) {
      this.$message.error(e)
    } finally {
      this.unlockVisable = false
    }
  }

  // 隐藏 tooltip
  private tooltipHider(e: MouseEvent) {
    this.tipVisiable = false
  }
}
</script>
<style lang="scss" scoped>
.extend-hover {
  width: 210px;
  height: 15px;
  background-color: transparent;
  position: fixed;
}

.lock-tooltip {
  display: inline-block;
  margin-bottom: 4px;
  margin-top: 4px;
}

.lock-tooltip-unlock {
  margin-left: 10px;
  color: $primary;
}

.lock-tooltip-unlock:hover {
  cursor: pointer;
  color: rgba(250, 131, 52, 80%);
}

.axis {
  &__wrap {
    position: relative;
    width: 100%;
    height: 70px;

    &--disabled {
      &:after {
        content: ' ';
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        background: rgba(255, 255, 255, 60%);
        cursor: not-allowed;
      }
    }
  }

  &__canvas {
    width: 100%;
    cursor: grab;

    &.dragging {
      cursor: grabbing;
    }
  }

  &__time {
    position: absolute;
    top: -22px;
    left: 50%;
    margin-left: -100px;
    width: 200px;
    text-align: center;
    color: $primary;
    font-size: 12px;
    font-weight: bold;
    user-select: none;
    border: 1px solid transparent;

    &__btn:hover {
      border: 1px solid $primary;
      padding: 3px 6px;
      border-radius: 5px;
      cursor: pointer;
    }
  }

  &__time__edit {
    position: absolute;
    left: 50%;
    margin-left: -110px;
    width: 220px;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    user-select: none;
    margin-top: -35px;
    height: 20px;
    // background-color: rgba(250, 208, 117, 0.897);
    border-radius: 6px 6px 15px 15px;
  }

  &__zoom {
    text-align: right;

    &__btn {
      display: inline-block;
      padding: 0 4px;
      cursor: pointer;
    }
  }
}

</style>
