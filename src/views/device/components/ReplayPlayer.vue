<template>
  <div class="replay-player">
    <div v-if="!recordList.length" class="empty-text">
      该时段暂无录像
    </div>
    <player
      v-if="recordList.length && currentRecord"
      ref="player"
      type="hls"
      :url="currentRecord.playUrl.hlsUrl"
      :auto-play="true"
      :has-control="false"
      :on-time-update="setCurrentTime"
    />
    <div class="timeline__box">
      <div ref="timelineWrap" class="timeline__wrap">
        <div ref="timeline" class="timeline" :class="{'dragging': axisDrag.isDragging}" @mousedown.stop.prevent="moveAxisStart($event)">
          <div
            v-if="currentTime"
            ref="handle"
            class="timeline__handle"
            :style="`left: ${handlePos}%;`"
            @mousedown.stop.prevent="moveHandleStart($event)"
          >
            <div class="timeline__current-time">
              <span>{{ dateFormat(currentTime) }}</span>
            </div>
          </div>
          <div class="timeline__axis">
            <div v-for="i in 24" :key="i" class="timeline__hour">
              {{ i > 10 ? '' : '0' }}{{ i - 1 }}:00
            </div>
            <div v-if="timelineRatio > 1" class="timeline__axis__slice">
              <div v-for="i in 24 * 4" :key="i" class="timeline__half__hour">.</div>
            </div>
          </div>
          <div
            v-for="(time, index) in timePositionList"
            :key="index"
            class="timeline__bar"
            :style="`left: ${time.left}%; width: ${time.width}%;`"
            @click="handleTimeline($event, time)"
          />
        </div>
      </div>
      <div class="timeline__settings">
        <div class="settings__btn settings_zoomin" @click="setTimelineRatio(1)">
          <svg-icon name="zoom-in" width="14px" height="14px" />
        </div>
        <div class="settings__btn settings_zoomout" @click="setTimelineRatio(0)">
          <svg-icon name="zoom-out" width="14px" height="14px" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { dateFormat } from '@/utils/date'
import Player from './Player.vue'

@Component({
  name: 'ReplayPlayer',
  components: {
    Player
  }
})
export default class extends Vue {
  @Prop()
  private currentDate?: number
  @Prop({
    default: []
  })
  private recordList!: Array<any>

  private dateFormat = dateFormat
  private currentRecord: any = null
  private currentListRecord: any = null
  private currentTime: number | null = null
  private handlePos = 0
  private timePositionList: Array<any> = []
  private pickerOptions = {
    disabledDate(time: any) {
      return time.getTime() > Date.now()
    }
  }
  private timelineRatio = 1
  private dialog = {
    play: false
  }
  private pager = {
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

  private get deviceId() {
    return this.$route.query.deviceId
  }

  private get player(): any {
    return this.$refs.player
  }

  private async mounted() {
    await this.init()
  }

  @Watch('recordList')
  private onRecordListChanged() {
    this.init()
  }

  /**
   * 初始化
   */
  private async init() {
    this.timePositionList = this.calcVideoPosition(this.recordList)
    this.initVideoPlayer()
  }

  /**
   * 初始化播放器
   */
  private initVideoPlayer() {
    if (this.recordList.length) {
      this.currentRecord = this.recordList[0]
      this.$nextTick(() => {
        this.setCurrentTime(0)
        this.player && this.player.reset()
      })
    }
  }

  /**
   * 设置操作具柄在时间轴中的位置
   * offsetTime: 单位(秒)
   */
  private setCurrentTime(offsetTime: number) {
    if (this.handleDrag.isDragging) return
    if (!offsetTime) return
    const currentTimestamp = this.currentRecord!.startAt + offsetTime * 1000
    this.currentTime = currentTimestamp
    this.handlePos = this.scale(Math.round((currentTimestamp - this.currentDate!) / 1000))
    this.setHandlePosition()
  }

  /**
   * 点击时间轴位置
   */
  private handleTimeline(e: any, record: any) {
    if (this.axisDrag.isMove) return
    const scale = e.offsetX / e.target.clientWidth
    let offsetTime = Math.ceil(scale * record.duration)
    offsetTime = offsetTime <= 0 ? 0 : offsetTime
    let isCurrent = true
    if (this.currentRecord !== record) {
      this.currentRecord = record
      isCurrent = false
    }
    this.$nextTick(() => {
      this.setCurrentTime(offsetTime)
      this.setHandlePosition()
      !isCurrent && this.player.reset()
      this.player.seek(offsetTime)
    })
  }

  /**
   * 拖拽时间轴具柄
   */
  private moveHandleStart(e: MouseEvent) {
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

  private onHandleMove(e: MouseEvent) {
    if (!this.handleDrag.isDragging) return
    this.handlePos = (e.x - this.handleDrag.deltaX - this.handleDrag.timelineSize.x) / this.handleDrag.timelineSize.width * 100
    this.currentTime = this.currentDate! + this.handlePos * 24 * 60 * 60 * 10
  }

  private onHandleMouseup(e: MouseEvent) {
    this.handleDrag.isDragging = false
    window.removeEventListener('mousemove', this.onHandleMove)
    window.removeEventListener('mouseup', this.onHandleMouseup)
    const currentTime = this.currentTime!
    let record = this.recordList.find(record => {
      return currentTime! >= record.startAt && currentTime! <= record.startAt + record.duration * 1000
    })
    if (record) {
      let offsetTime = 0
      let isCurrent = true
      if (this.currentRecord.index !== record.index) {
        this.currentRecord = record
        isCurrent = false
      }
      this.$nextTick(() => {
        offsetTime = (currentTime - this.currentRecord.startAt) / 1000
        !isCurrent && this.player.reset()
        this.player.seek(offsetTime)
        this.setHandlePosition()
      })
    }
  }

  /**
   * 设置具柄位置
   */
  private setHandlePosition() {
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
  private calcVideoPosition(list: Array<any>) {
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
  private scale(sec: number) {
    return sec / (24 * 60 * 60) * 100
  }

  /**
   * 设置时间轴比例
   */
  private setTimelineRatio(method: number) {
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
  private moveAxisStart(e: MouseEvent) {
    this.axisDrag.isDragging = true
    this.axisDrag.isMove = false
    const $timelineWrap: any = this.$refs.timelineWrap
    this.axisDrag.deltaX = $timelineWrap.scrollLeft
    this.axisDrag.startX = e.x
    window.addEventListener('mousemove', this.onAxisMove)
    window.addEventListener('mouseup', this.onAxisMouseup)
  }

  private onAxisMove(e: MouseEvent) {
    if (!this.axisDrag.isDragging) return
    this.axisDrag.isMove = true
    const $timelineWrap: any = this.$refs.timelineWrap
    $timelineWrap.scrollLeft = this.axisDrag.deltaX + this.axisDrag.startX - e.x
  }

  private onAxisMouseup(e: MouseEvent) {
    window.removeEventListener('mousemove', this.onAxisMove)
    window.removeEventListener('mouseup', this.onAxisMouseup)
    this.axisDrag.isDragging = false
  }
}
</script>
<style lang="scss" scoped>
  .replay-player {
    display: flex;
    flex-direction: column;
    background: #333;
    position: relative;
    .video-wrap {
      flex: 1;
    }
    ::v-deep video {
      position: absolute;
      width: 100%;
      height: 100%;
      display: block;
      background: #000;
    }
  }
  .replay-time-list {
    flex: 2;
    margin-left: 15px;
    overflow: hidden;

    .el-range-editor {
      width: 100%;
      margin-bottom: 15px;
    }
  }
  .timeline__box {
    position: relative;
  }
  .timeline__wrap {
    padding-top: 16px;
    overflow: auto;
    * {
      user-select:none;
    }
    &::-webkit-scrollbar {
      height: 10px;
    }
    &::-webkit-scrollbar-track-piece {
      background-color: #222;
    }
    &::-webkit-scrollbar-thumb {
      height: 10px;
      background: #888;
      border-radius: 4px;
      cursor: pointer;
    }
  }
  .timeline {
    min-width: 930px;
    position: relative;
    margin-top: 10px;
    padding: 0 4px 15px 4px;
    display: flex;
    background: #333;
    cursor: grab;
    &__handle {
      position: absolute;
      z-index: 10;
      bottom: 0;
      border-right: 2px solid $primary;
      height: 120%;
      cursor: move;
      .timeline__current-time {
        position: absolute;
        font-size: 12px;
        width: 140px;
        left: -65px;
        top: -14px;
        padding: 4px 0;
        border-radius: 5px;
        text-align: center;
        background: $primary;
        color: #fff;
        transition: left .2s;
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
      border-left: 1px solid #666;
      border-bottom: 1px solid #666;
      padding: 6px 0;
      font-size: 11px;
      color: #fff;
      &:first-child {
        border-left: none;
      }
    }
    &__half__hour {
      flex: 1 1 0;
      border-left: 1px solid #666;
      height: 5px;
      color: #333;
      &:first-child {
        border-left: none;
      }
    }
    &__bar {
      position: absolute;
      bottom: 0;
      border-bottom: 16px solid #3e80c1;
      height: 100%;
      cursor: pointer;
    }
    &.dragging * {
      cursor: grabbing;
    }
  }
  .timeline__settings {
    position: absolute;
    top: 6px;
    right: 10px;
    display: flex;
    color: #fff;

    .settings__btn {
      margin: 0 5px;
      cursor: pointer;
    }
  }
  .empty-text {
    padding-top: 30px;
  }
</style>
