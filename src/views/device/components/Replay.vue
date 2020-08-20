<template>
  <div v-loading="loading" class="replay-wrap">
    <div class="filter-container">
      <el-date-picker
        v-model="currentDate"
        type="date"
        value-format="timestamp"
        placeholder="选择日期"
        :picker-options="pickerOptions"
        @change="changeDate"
      />
      <el-radio-group v-model="viewModel">
        <el-radio-button label="timeline">时间轴视图</el-radio-button>
        <el-radio-button label="list">列表视图</el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="viewModel === 'timeline'" class="replay-player">
      <div v-if="recordList.length && !loading">
        <div ref="video" class="replay-video" />
        <div class="timeline__current-time">{{ dateFormat(currentTime) }}</div>
        <div ref="timelineWrap" class="timeline--wrap">
          <div ref="timeline" class="timeline">
            <div
              class="timeline__handle"
              :style="`left: ${handlePos}%;`"
            />
            <div
              v-for="(time, index) in timePositionList"
              :key="index"
              class="timeline__bar"
              :style="`left: ${time.left}%; width: ${time.width}%;`"
              @click="handleTimeline($event, time)"
            />
            <div class="timeline__hours">
              <div v-for="i in 24" :key="i" class="timeline__hour">
                {{ i > 10 ? '' : '0' }}{{ i - 1 }}:00
              </div>
            </div>
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
      <div v-else class="empty-text">
        所选日期暂无录像
      </div>
    </div>
    <div v-else class="replay-time-list">
      <el-table :data="recordListSlice" empty-text="所选日期暂无录像">
        <el-table-column label="开始时间" prop="startAt" min-width="180" :formatter="dateFormatInTable" />
        <el-table-column label="时长" prop="duration" />
        <el-table-column prop="action" label="操作" width="200" fixed="right">
          <template slot-scope="{row}">
            <el-button v-if="row.loading" type="text" disabled>正在转码...</el-button>
            <el-button v-if="!row.loading" type="text" @click="downloadReplay(row)">下载录像</el-button>
            <el-button type="text" @click="playReplay(row)">播放录像</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pager.pageNum"
        :page-size="pager.pageSize"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <replay-player v-if="dialog.play" :video="currentListRecord" @on-close="closeReplayPlayer" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { dateFormatInTable, dateFormat } from '@/utils/date'
import Ctplayer from '../models/Ctplayer'
import { getDeviceRecords, getDeviceRecord } from '@/api/device'
import ReplayPlayer from './dialogs/ReplayPlayer.vue'

@Component({
  name: 'Replay',
  components: {
    ReplayPlayer
  }
})
export default class extends Vue {
  private player?: Ctplayer
  private dateFormatInTable = dateFormatInTable
  private dateFormat = dateFormat
  private viewModel = 'timeline'
  private currentRecord: any = null
  private currentListRecord: any = null
  private currentDate = new Date(new Date().toLocaleDateString()).getTime()
  private currentTime: Date | null = null
  private handlePos = 0
  private loading = false
  private recordList: Array<any> = []
  private recordListSlice: Array<any> = []
  private recordIndex = 0
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

  private get deviceId() {
    return this.$route.query.deviceId
  }

  public stopVideo() {
    this.player && this.player.stop()
  }

  private async mounted() {
    await this.init()
    window.addEventListener('resize', this.resizeVideo)
  }

  private beforeDestroy() {
    this.player && this.player.disposePlayer()
    window.removeEventListener('resize', this.resizeVideo)
  }

  @Watch('$route.query')
  private onRouterChange() {
    this.player && this.player.disposePlayer()
    this.init()
  }

  @Watch('viewModel')
  private onViewModelChange(val: string) {
    this.player && this.player.disposePlayer()
    this.$nextTick(() => {
      val === 'timeline' && this.initVideoPlayer()
    })
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
    const $video: HTMLDivElement = this.$refs.video as HTMLDivElement
    if (!$video) return
    const videoSize = $video.getBoundingClientRect()
    const width = videoSize.width
    const height = width * 9 / 16
    const maxHeight = document.body.clientHeight - videoSize.top - 150
    $video.style.height = Math.min(height, maxHeight) + 'px'
  }

  /**
   * 切换日期
   */
  private changeDate() {
    this.player && this.player.disposePlayer()
    this.init()
  }

  /**
   * 获取回放列表
   */
  private async getRecordList() {
    try {
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
      this.getRecordListByPage()
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
      this.player = this.createPlayer(this.currentRecord, true)
      this.setCurrentTime(this.currentRecord, 0)
      this.resizeVideo()
    }
  }

  /**
   * 创建播放器
   */
  private createPlayer(video: any, autoPlay: boolean = false) {
    const player = new Ctplayer({
      wrap: this.$refs.video,
      autoPlay,
      hasControl: true,
      source: video.playUrl.hlsUrl,
      type: video.videoCoding === 'h264' ? 'hls' : 'h265-hls',
      onTimeUpdate: (currentTime: number) => {
        if (this.currentRecord) {
          this.setCurrentTime(this.currentRecord, currentTime)
        }
      },
      onResizeScreen: (originWidth: number, originHeight: number) => {
        const $video: HTMLDivElement = this.$refs.video as HTMLDivElement
        const $canvas: HTMLCanvasElement | null = $video.querySelector('canvas')
        const videoSize = $video.getBoundingClientRect()
        const width = videoSize.width
        const height = videoSize.width
        if ($canvas) {
          const proportion = width / originWidth!
          $canvas.style.position = 'absolute'
          $canvas.style.transform = `scale(${proportion})`
          $canvas.style.transformOrigin = `top left`
          $canvas.style.top = (height - originHeight) / 2 * proportion + 'px'
        }
      },
      onEnded: () => {
        if (this.recordIndex === this.pager.total) return
        const nextRecord = this.recordList[this.recordIndex + 1]
        if (nextRecord) {
          this.currentRecord = nextRecord
          this.player && this.player.disposePlayer()
          this.player = this.createPlayer(nextRecord, true)
          this.recordIndex = this.currentRecord.index
          this.player.play()
          this.setCurrentTime(nextRecord, 0)
        }
      }
    })
    return player
  }

  /**
   * 点击时间轴位置
   */
  private handleTimeline(e: any, record: any) {
    const scale = e.offsetX / e.target.clientWidth
    let currentTime = Math.ceil(scale * record.duration)
    currentTime = currentTime <= 0 ? 0 : currentTime
    if (this.currentRecord !== record || !this.player) {
      this.currentRecord = record
      this.player && this.player.disposePlayer()
      this.player = this.createPlayer(record, true)
      this.recordIndex = this.currentRecord.index
      this.player.play()
    }
    this.setCurrentTime(record, currentTime)
    this.player.seek(currentTime)
    console.log(this.currentRecord.index, this.currentRecord, currentTime)
    // this.setCurrentTime(record, currentTime)
  }

  /**
   * 设置操作具柄在时间轴中的位置
   * currentTime: 单位(秒)
   */
  private setCurrentTime(record: any, currentTime: number) {
    const currentTimestamp = record.startAt + currentTime * 1000
    this.currentTime = new Date(currentTimestamp)
    this.handlePos = this.scale(Math.round((currentTimestamp - this.currentDate) / 1000))
  }

  /**
   * 计算视频在时间轴中的位置
   */
  private calcVideoPosition(list: Array<any>) {
    return list.map((record: any) => {
      return {
        width: this.scale(record.duration + 1).toFixed(6),
        left: this.scale(Math.round((record.startAt - this.currentDate) / 1000)).toFixed(6),
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
   * 关闭播放录像弹出框
   */
  private closeReplayPlayer() {
    this.dialog.play = false
    this.currentListRecord = null
  }

  /**
   * 分页
   */
  private async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getRecordListByPage()
  }

  private async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getRecordListByPage()
  }

  private getRecordListByPage() {
    this.recordListSlice = this.recordList.slice((this.pager.pageNum - 1) * this.pager.pageSize, this.pager.pageNum * this.pager.pageSize)
  }
}
</script>
<style lang="scss" scoped>
  .filter-container {
    text-align: right;
    .el-date-editor {
      margin-right: 10px;
      vertical-align: middle;
    }
  }

  .replay-player {
    .replay-video {
      width: 100%;
      background: #000;
      ::v-deep video {
        width: 100%;
        height: 100%;
      }
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
    overflow: auto;
  }
  .timeline__current-time {
    font-size: 16px;
    font-weight: bold;
    margin-top: 10px;
  }
  .timeline {
    min-width: 1000px;
    position: relative;
    margin-top: 10px;
    padding: 8px 4px;
    display: flex;
    background: #f2f2f2;
    border-radius: 4px;
    &__handle {
      position: absolute;
      z-index: 10;
      top: 0;
      border-right: 2px solid $primary;
      height: 100%;
      &__time {
        position: absolute;
      }
    }
    &__hours {
      display: flex;
      width: 100%;
    }
    &__hour {
      flex: 1 1 0;
      text-align: center;
      border-left: 1px solid #ccc;
      border-top: 1px solid #ccc;
      padding: 8px 0;
      font-size: 12px;
      &:first-child {
        border-left: none;
      }
    }
    &__bar {
      position: absolute;
      top: 0;
      border-top: 8px solid $light-blue;
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
