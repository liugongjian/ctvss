import { Component, Vue, Prop } from 'vue-property-decorator'
import { dateFormat } from '@/utils/date'
import Player from '../components/Player.vue'

@Component({
  components: {
    Player
  }
})
export default class extends Vue {
  @Prop({
    default: () => {
      return []
    }
  })
  public recordList!: Array<any>
  @Prop()
  public currentDate?: number
  @Prop({
    default: false
  })
  public isFullscreen?: boolean
  @Prop({
    default: false
  })
  public hasPlaylive?: boolean
  @Prop()
  public replayType?: string

  public dateFormat = dateFormat
  public currentRecord: any = null
  public currentListRecord: any = null
  public currentTime: number | null = null
  public startTime = 0
  public handlePos = 0
  public timePositionList: Array<any> = []
  public timelineRatio = 1
  public dialog = {
    play: false
  }
  public pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  public handleDrag: any = {
    isDragging: false,
    timelineSize: null,
    deltaX: 0
  }
  public axisDrag: any = {
    isDragging: false,
    isMove: false,
    deltaX: 0,
    startX: 0
  }

  public get player(): any {
    return this.$refs.player
  }

  /**
   * 设置操作具柄在时间轴中的位置
   * offsetTime: 单位(秒)
   */
  public setCurrentTime(offsetTime: number) {
    if (this.handleDrag.isDragging) return
    if (!offsetTime) return
    const currentTimestamp = this.currentRecord!.startAt + offsetTime * 1000
    this.currentTime = currentTimestamp
    this.handlePos = this.scale(Math.round((currentTimestamp - this.currentDate!) / 1000))
    this.setHandlePosition()
  }

  /**
   * 拖拽时间轴具柄
   */
  public moveHandleStart(e: MouseEvent) {
    this.handleDrag.isDragging = true
    const $dirList: any = this.$refs.dirList
    const $timeline: any = this.$refs.timeline
    this.handleDrag.timelineSize = $timeline.getBoundingClientRect()
    const $handle: any = this.$refs.handle
    const handleSize = $handle.getBoundingClientRect()
    const offsetX = e.x - handleSize.x
    this.handleDrag.deltaX = offsetX - handleSize.width
    window.addEventListener('mousemove', this.onHandleMove)
    window.addEventListener('mouseup', this.onHandleMouseup)
  }

  public onHandleMove(e: MouseEvent) {
    if (!this.handleDrag.isDragging) return
    this.handlePos = (e.x - this.handleDrag.deltaX - this.handleDrag.timelineSize.x) / this.handleDrag.timelineSize.width * 100
    this.currentTime = this.currentDate! + this.handlePos * 24 * 60 * 60 * 10
  }

  public onHandleMouseup(e: MouseEvent) {
    this.handleDrag.isDragging = false
    window.removeEventListener('mousemove', this.onHandleMove)
    window.removeEventListener('mouseup', this.onHandleMouseup)
    if (this.replayType === 'cloud') {
      this.setRecordByCurrentTime()
    } else {
      this.setStartTime()
    }
  }

  /**
   * 根据当前时间选择录像切片
   */
  public setRecordByCurrentTime(backToStart = false) {
    const currentTime = this.currentTime!
    let record = this.recordList.find(record => {
      return (currentTime! >= record.startAt) && (currentTime! <= (record.startAt + record.duration * 1000))
    })
    if (record) {
      let offsetTime = 0
      let isCurrent = true
      if (!this.currentRecord || this.currentRecord.index !== record.index) {
        this.currentRecord = record
        isCurrent = false
      }
      this.$nextTick(() => {
        offsetTime = (currentTime - this.currentRecord.startAt) / 1000
        !isCurrent && this.player.reset()
        this.player.seek(offsetTime)
        this.setHandlePosition()
      })
    } else {
      console.log('destory')
      this.player && this.player.stop()
    }
  }

  /**
   * 设置启始时间
   */
  public setStartTime() {
    this.startTime = this.currentTime!
  }

  /**
   * 设置具柄位置
   */
  public setHandlePosition() {
    const $handle: any = this.$refs.handle
    if (!$handle) return
    const $time = $handle.querySelector('.timeline__current-time')
    const handleSize = $handle.getBoundingClientRect()
    const $timeline: any = this.$refs.timeline
    const timelineSize = $timeline.getBoundingClientRect()
    if ((handleSize.x - $time.offsetWidth / 2) < timelineSize.x) {
      $time.style.left = `-5px`
    } else if ((handleSize.x + $time.offsetWidth / 2) > (timelineSize.x + timelineSize.width)) {
      $time.style.left = `-${$time.offsetWidth - 5}px`
    } else {
      $time.style.left = `-${$time.offsetWidth / 2}px`
    }
  }

  /**
   * 计算视频在时间轴中的位置
   */
  public calcVideoPosition(list: Array<any>) {
    return list.map((record: any) => {
      return {
        width: this.scale(record.duration + 1).toFixed(6),
        left: this.scale(Math.round((record.startAt - this.currentDate!) / 1000)).toFixed(6),
        ...record
      }
    })
  }

  /**
   * 秒 / 一天的秒的比率
   */
  public scale(sec: number) {
    return sec / (24 * 60 * 60) * 100
  }

  /**
   * 设置时间轴比例
   */
  public setTimelineRatio(method: number) {
    let timelineRatio = method ? this.timelineRatio * 2 : this.timelineRatio / 2
    timelineRatio = timelineRatio < 1 ? 1 : timelineRatio
    const timelineWrap: any = this.$refs.timelineWrap
    const timeline: any = this.$refs.timeline
    const originWidth = timelineWrap.clientWidth
    const zoomWidth = originWidth * timelineRatio
    timeline.style.width = `${zoomWidth}px`
    this.timelineRatio = timelineRatio
  }

  /**
   * 拖拽时间轴
   */
  public moveAxisStart(e: MouseEvent) {
    this.axisDrag.isDragging = true
    this.axisDrag.isMove = false
    const $timelineWrap: any = this.$refs.timelineWrap
    this.axisDrag.deltaX = $timelineWrap.scrollLeft
    this.axisDrag.startX = e.x
    window.addEventListener('mousemove', this.onAxisMove)
    window.addEventListener('mouseup', this.onAxisMouseup)
  }

  public onAxisMove(e: MouseEvent) {
    if (!this.axisDrag.isDragging) return
    this.axisDrag.isMove = true
    const $timelineWrap: any = this.$refs.timelineWrap
    $timelineWrap.scrollLeft = this.axisDrag.deltaX + this.axisDrag.startX - e.x
  }

  public onAxisMouseup(e: MouseEvent) {
    window.removeEventListener('mousemove', this.onAxisMove)
    window.removeEventListener('mouseup', this.onAxisMouseup)
    this.axisDrag.isDragging = false
  }

  /**
   * 播放直播
   */
  public playlive() {
    this.$emit('onPlaylive')
  }

  /**
   * 开启全屏
   */
  public fullscreen() {
    this.$emit('onFullscreen')
  }

  /**
   * 退出全屏
   */
  public exitFullscreen() {
    this.$emit('onExitFullscreen')
  }
}
