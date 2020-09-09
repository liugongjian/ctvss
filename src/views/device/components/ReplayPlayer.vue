<template>
  <div v-loading="loading" class="replay-player">
    <div>
      <player
        v-if="currentRecord"
        ref="player"
        type="hls"
        :url="currentRecord.playUrl.hlsUrl"
        :auto-play="true"
        :has-control="false"
        :on-time-update="setCurrentTime"
      />
      <div ref="timelineWrap" class="timeline--wrap">
        <div ref="timeline" class="timeline">
          <div
            v-if="currentTime"
            ref="handle"
            class="timeline__handle"
            :style="`left: ${handlePos}%;`"
            @mousedown="moveHandleStart($event)"
          >
            <div class="timeline__current-time">
              <span>{{ dateFormat(currentTime) }}</span>
            </div>
          </div>
          <div class="timeline__axis">
            <div v-for="i in 24" :key="i" class="timeline__hour">
              {{ i > 10 ? '' : '0' }}{{ i - 1 }}:00
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
        <label>缩放时间轴:</label>
        <el-select v-model="timelineRatio" @change="changeTimelineRatio">
          <el-option :value="1" label="1倍" />
          <el-option :value="2" label="2倍" />
          <el-option :value="4" label="4倍" />
          <el-option :value="6" label="6倍" />
          <el-option :value="8" label="8倍" />
          <el-option :value="10" label="10倍" />
          <el-option :value="20" label="20倍" />
          <el-option :value="40" label="30倍" />
          <el-option :value="60" label="60倍" />
        </el-select>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { dateFormatInTable, dateFormat } from '@/utils/date'
import { getDeviceRecords, getDeviceRecord } from '@/api/device'
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

  private dateFormatInTable = dateFormatInTable
  private dateFormat = dateFormat
  private viewModel = 'timeline'
  private currentRecord: any = null
  private currentListRecord: any = null
  private currentTime: number | null = null
  private handlePos = 0
  private loading = false
  private recordList: Array<any> = []
  private recordListSlice: Array<any> = []
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
  public drag: any = {
    isDragging: false,
    timelineSize: null,
    deltaX: 0
  }

  private get deviceId() {
    return this.$route.query.deviceId
  }

  private get player(): any {
    return this.$refs.player
  }

  private async mounted() {
    await this.init()
    window.addEventListener('resize', this.resizeVideo)
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.resizeVideo)
  }

  @Watch('currentDate')
  private onCurrentDateChange() {
    this.init()
  }

  /**
   * 初始化
   */
  private async init() {
    await this.getRecordList()
    this.timePositionList = this.calcVideoPosition(this.recordList)
    this.initVideoPlayer()
  }

  /**
   * 设置播放器大小
   */
  private resizeVideo() {
    const player: any = this.$refs.player
    if (!player) return
    const $player = player.$el
    const playerSize = $player.getBoundingClientRect()
    const width = playerSize.width
    const height = width * 9 / 16
    const maxHeight = document.body.clientHeight - playerSize.top - 150
    $player.style.height = Math.min(height, maxHeight) + 'px'
  }

  /**
   * 切换日期
   */
  private changeDate() {
    this.init()
  }

  /**
   * 获取回放列表
   */
  private async getRecordList() {
    try {
      if (!this.currentDate) return
      this.loading = true
      const res = await getDeviceRecords({
        deviceId: this.deviceId,
        startTime: this.currentDate / 1000,
        endTime: this.currentDate / 1000 + 24 * 60 * 60,
        pageSize: 9999
      })
      this.recordList = res.records.map((record: any, index: number) => {
        record.startAt = new Date(record.startTime).getTime()
        record.loading = false
        record.index = index
        return record
      })
      this.pager.total = res.totalNum
    } catch (e) {
      this.recordList = []
      console.log(e)
    } finally {
      this.loading = false
    }
  }

  /**
   * 初始化播放器
   */
  private initVideoPlayer() {
    if (this.recordList.length) {
      this.currentRecord = this.recordList[0]
      this.$nextTick(() => {
        this.setCurrentTime(0)
        this.resizeVideo()
        this.player && this.player.reset()
      })
    }
  }

  /**
   * 设置操作具柄在时间轴中的位置
   * offsetTime: 单位(秒)
   */
  private setCurrentTime(offsetTime: number) {
    if (this.drag.isDragging) return
    if (!offsetTime) return
    const currentTimestamp = this.currentRecord!.startAt + offsetTime * 1000
    this.currentTime = currentTimestamp
    this.handlePos = this.scale(Math.round((currentTimestamp - this.currentDate!) / 1000))
    this.setHandlePosition()
  }

  /**
   * 播放录像（模态框）
   */
  private playReplay(record: any) {
    this.dialog.play = true
    this.currentListRecord = record
  }

  /**
   * 下载录像
   */
  private async downloadReplay(record: any) {
    try {
      record.loading = true
      const res = await getDeviceRecord({
        deviceId: this.deviceId,
        startTime: record.startAt / 1000,
        fileFormat: 'mp4'
      })
      if (res.downloadUrl) {
        const link: HTMLAnchorElement = document.createElement('a')
        link.setAttribute('href', res.downloadUrl)
        link.click()
        link.remove()
      }
    } catch (e) {
      console.log(e)
    } finally {
      record.loading = false
    }
  }

  /**
   * 点击时间轴位置
   */
  private handleTimeline(e: any, record: any) {
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
    const $dirList: any = this.$refs.dirList
    this.drag.isDragging = true
    const $timeline: any = this.$refs.timeline
    this.drag.timelineSize = $timeline.getBoundingClientRect()
    const $handle: any = this.$refs.handle
    const handleSize = $handle.getBoundingClientRect()
    const offsetX = e.x - handleSize.x
    this.drag.deltaX = offsetX - handleSize.width
    window.addEventListener('mousemove', this.onHandleMove)
    window.addEventListener('mouseup', this.onHandleMouseup)
  }

  private onHandleMove(e: MouseEvent) {
    if (!this.drag.isDragging) return
    this.handlePos = (e.x - this.drag.deltaX - this.drag.timelineSize.x) / this.drag.timelineSize.width * 100
    this.currentTime = this.currentDate! + this.handlePos * 24 * 60 * 60 * 10
  }

  private onHandleMouseup(e: MouseEvent) {
    this.drag.isDragging = false
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
    } else if ((handleSize.x + $time.offsetWidth / 2) > timelineSize.width) {
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

  private changeTimelineRatio() {
    const timelineWrap: any = this.$refs.timelineWrap
    const timeline: any = this.$refs.timeline
    const originWidth = timelineWrap.clientWidth
    const zoomWidth = originWidth * this.timelineRatio
    timeline.style.width = `${zoomWidth}px`
  }
}
</script>
<style lang="scss" scoped>
  .replay-player {
    background: #333;
    ::v-deep video {
      width: 100%;
      height: 100%;
      display: block;
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
  .timeline--wrap {
    position: relative;
    z-index: 200;
    padding-top: 12px;
    overflow: auto;
    * {
      user-select:none;
    }
  }
  .timeline {
    min-width: 1000px;
    position: relative;
    margin-top: 10px;
    padding: 0 4px 15px 4px;
    display: flex;
    background: #333;
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
        top: -12px;
        padding: 4px;
        border-radius: 5px;
        text-align: center;
        background: $primary;
        color: #fff;
        transition: left .2s;
      }
    }
    &__axis {
      display: flex;
      width: 100%;
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
    &__bar {
      position: absolute;
      bottom: 0;
      border-bottom: 16px solid #3e80c1;
      height: 100%;
      cursor: pointer;
    }
  }
  .timeline__settings {
    text-align: right;
    margin-top: 10px;
    .el-select {
      width: 100px;
    }
    label {
      margin-right: 5px;
    }
  }
  .empty-text {
    padding-top: 30px;
  }
</style>
