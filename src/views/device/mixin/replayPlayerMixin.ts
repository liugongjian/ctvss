import { Component, Vue, Prop } from 'vue-property-decorator'
import { dateFormat } from '@/utils/date'
import Player from '../components/Player.vue'

@Component({
  components: {
    Player
  }
})
export default class extends Vue {
  @Prop()
  public currentDate?: number
  @Prop({
    default: false
  })
  public isFullscreen?: boolean
  // 是否显示返回实时预览
  @Prop({
    default: false
  })
  public hasPlaylive?: boolean
  // 录像类型(cloud: 云端, local: 本地)
  @Prop()
  public replayType?: string

  public dateFormat = dateFormat
  public currentRecord: any = null
  public currentListRecord: any = null
  public currentTime: number | null = null
  public startTime = 0
  public handlePos = 0
  public timePositionList: Array<any> = []

  // 时间轴缩放比例
  public timelineRatio = 1
  public dialog = {
    play: false
  }
  public pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
  // 游标拖动数据
  public handleDrag: any = {
    isDragging: false,
    timelineSize: null,
    deltaX: 0
  }
  // 时间轴拖动数据
  public axisDrag: any = {
    isDragging: false,
    isMove: false,
    deltaX: 0,
    startX: 0
  }

  /**
   * 播放器DOM
   */
  public get player(): any {
    return this.$refs.player
  }

  /**
   * 设置游标在时间轴中的位置
   * offsetTime: 单位(秒)
   */
  public setCurrentTime(offsetTime: number) {
    if (this.handleDrag.isDragging) return
    if (offsetTime === null) return
    const duration = this.currentRecord.duration
    const currentTimestamp = this.currentRecord!.startAt + offsetTime * 1000
    const startPos = (this.currentRecord!.startAt - this.currentDate) / 1000
    const deltaTime = (this.currentRecord.endTime - this.currentRecord.startTime) / 1000
    this.currentTime = currentTimestamp
    // this.handlePos = this.scale(Math.round((currentTimestamp - this.currentDate!) / 1000))
    this.handlePos = this.scale(startPos + this.calcCurrentSpeed(deltaTime, duration) * offsetTime)
    this.setHandlePosition()
  }

  /**
   * 拖拽游标
   */
  public moveHandleStart(e: MouseEvent) {
    this.handleDrag.isDragging = true
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
   * 拖拽游标时移动鼠标
   */
  public onHandleMove(e: MouseEvent) {
    if (!this.handleDrag.isDragging) return
    this.handlePos = (e.x - this.handleDrag.deltaX - this.handleDrag.timelineSize.left) / this.handleDrag.timelineSize.width * 100
    this.currentTime = this.currentDate! + this.handlePos * 24 * 60 * 60 * 10
  }

  /**
   * 拖拽游标后抬起鼠标
   */
  public onHandleMouseup() {
    this.handleDrag.isDragging = false
    window.removeEventListener('mousemove', this.onHandleMove)
    window.removeEventListener('mouseup', this.onHandleMouseup)
    this.setRecordByCurrentTime()
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

  /**
   * 拖拽时间轴时移动鼠标
   */
  public onAxisMove(e: MouseEvent) {
    if (!this.axisDrag.isDragging) return
    this.axisDrag.isMove = true
    const $timelineWrap: any = this.$refs.timelineWrap
    $timelineWrap.scrollLeft = this.axisDrag.deltaX + this.axisDrag.startX - e.x
  }

  /**
   * 拖拽时间轴后抬起鼠标
   */
  public onAxisMouseup() {
    window.removeEventListener('mousemove', this.onAxisMove)
    window.removeEventListener('mouseup', this.onAxisMouseup)
    this.axisDrag.isDragging = false
  }

  /**
   * 根据当前时间选择录像切片
   */
  public setRecordByCurrentTime() {}

  /**
   * 设置具柄样式位置(向左，居中，向右)
   */
  public setHandlePosition() {
    const $handle: any = this.$refs.handle
    if (!$handle) return
    const $time = $handle.querySelector('.timeline__current-time')
    const handleSize = $handle.getBoundingClientRect()
    const $timeline: any = this.$refs.timeline
    const timelineSize = $timeline.getBoundingClientRect()
    if ((handleSize.left - $time.offsetWidth / 2) < timelineSize.left) {
      $time.style.left = `-5px`
    } else if ((handleSize.left + $time.offsetWidth / 2) > (timelineSize.left + timelineSize.width)) {
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
      const deltaTime = (new Date(record.endTime)).getTime() - (new Date(record.startTime)).getTime()
      return {
        width: this.scale(deltaTime / 1000 + 1).toFixed(6),
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
   * 播放速度（每一段 record 速度不一定一样）
   * 一秒与当前 record 片段时长的比率
   */
  public calcCurrentSpeed(deltaTime: number, duration: number) {
    return deltaTime / duration
  }

  /**
   * 设置时间轴比例
   */
  public setTimelineRatio(method: number) {
    let timelineRatio = method ? this.timelineRatio * 2 : this.timelineRatio / 2
    timelineRatio = timelineRatio < 1 ? 1 : timelineRatio
    const timelineWrap: any = this.$refs.timelineWrap
    const timeline: any = this.$refs.timeline
    const handle: any = this.$refs.handle
    const originWidth = timelineWrap.clientWidth
    const zoomWidth = originWidth * timelineRatio
    timeline.style.width = `${zoomWidth}px`
    this.timelineRatio = timelineRatio
    // 居中时间轴具柄
    timelineWrap.scrollLeft = handle.offsetLeft - timelineWrap.clientWidth / 2
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
