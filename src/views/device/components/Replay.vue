<template>
  <div class="replay-wrap">
    <div class="filter-container">
      <el-date-picker
        v-model="currentDate"
        type="date"
        value-format="timestamp"
        placeholder="选择日期"
        :picker-options="pickerOptions"
      />
      <el-radio-group v-model="viewModel">
        <el-radio-button label="timeline">时间轴视图</el-radio-button>
        <el-radio-button label="list">列表视图</el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="viewModel === 'timeline'" class="replay-player">
      <div ref="video" class="replay-video" />
      <div class="timeline__current-time">{{ dateFormat(currentTime) }}</div>
      <div class="timeline--wrap">
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
    </div>
    <div v-else class="replay-time-list">
      <el-table :data="videoList">
        <el-table-column label="开始时间" prop="startAt" min-width="180" :formatter="dateFormatInTable" />
        <el-table-column label="时长" prop="duration" />
        <el-table-column prop="action" label="操作" width="180" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" @click="changeReplay(row)">下载录像</el-button>
            <el-button type="text" @click="playReplay(row)">播放录像</el-button>
          </template>
        </el-table-column>
      </el-table>
      <replay-player v-if="dialog.play" :video="currentListVideo" @on-close="closeReplayPlayer" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { dateFormatInTable, dateFormat } from '@/utils/date'
import Ctplayer from '@/utils/player'
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
  private currentVideo: any = null
  private currentListVideo: any = null
  private currentDate = new Date(new Date('2020-8-6').toLocaleDateString()).getTime()
  private currentTime: Date | null = null
  private handlePos = 0
  private videoList: Array<any> = []
  private timePositionList: Array<any> = []
  private pickerOptions = {
    disabledDate(time: any) {
      return time.getTime() > Date.now()
    }
  }
  private dialog = {
    play: false
  }

  public stopVideo() {
    this.player && this.player.stop()
  }

  private mounted() {
    this.getVideoList()
    this.timePositionList = this.calcVideoPosition(this.videoList)
    this.initVideoPlayer()
    window.addEventListener('resize', this.resizeVideo)
  }

  private beforeDestroy() {
    this.player && this.player.disposePlayer()
    window.removeEventListener('resize', this.resizeVideo)
  }

  @Watch('viewModel')
  private onViewModelChange(val: string) {
    this.player && this.player.disposePlayer()
    this.$nextTick(() => {
      val === 'timeline' && this.initVideoPlayer()
    })
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
    const maxHeight = document.body.clientHeight - videoSize.top - 132
    $video.style.height = Math.min(height, maxHeight) + 'px'
  }

  /**
   * 获取回放列表
   */
  private getVideoList() {
    // this.videoList = [{
    //   duration: 1800,
    //   // hls: 'http://127.0.0.1:8082/h265_hls.m3u8',
    //   // type: 'h265',
    //   hls: 'https://vod-origin-mehf.gdoss.xstore.ctyun.cn/ec56f6f38cbf4083b54305733a38eb01.m3u8',
    //   type: 'h264',
    //   startAt: 1596672000000
    // },
    // {
    //   duration: 1800,
    //   hls: 'https://vod-origin-mehf.gdoss.xstore.ctyun.cn/ec56f6f38cbf4083b54305733a38eb01.m3u8',
    //   type: 'h264',
    //   startAt: 1596673800000
    // },
    // {
    //   duration: 1800,
    //   hls: 'https://vod-origin-mehf.gdoss.xstore.ctyun.cn/ec56f6f38cbf4083b54305733a38eb01.m3u8',
    //   type: 'h264',
    //   startAt: 1596675600000
    // },
    // {
    //   duration: 1800,
    //   hls: 'https://vod-origin-mehf.gdoss.xstore.ctyun.cn/ec56f6f38cbf4083b54305733a38eb01.m3u8',
    //   type: 'h264',
    //   startAt: 1596686400000
    // }]
    this.videoList = [{
      duration: 1800,
      hls: 'http://127.0.0.1:8080/data/video2/playlist.m3u8',
      type: 'h265',
      startAt: 1596672000000
    },
    {
      duration: 1800,
      hls: 'http://127.0.0.1:8080/data/video2/playlist.m3u8',
      type: 'h265',
      startAt: 1596673800000
    },
    {
      duration: 1800,
      hls: 'http://127.0.0.1:8080/data/video2/playlist.m3u8',
      type: 'h265',
      startAt: 1596675600000
    },
    {
      duration: 1800,
      hls: 'http://127.0.0.1:8080/data/video2/playlist.m3u8',
      type: 'h265',
      startAt: 1596686400000
    }]
  }

  /**
   * 初始化播放器
   */
  private initVideoPlayer() {
    if (this.videoList.length) {
      this.currentVideo = this.videoList[0]
      this.player = this.createPlayer(this.currentVideo)
      this.setCurrentTime(this.currentVideo, 0)
      this.resizeVideo()
    }
  }

  /**
   * 创建播放器
   */
  private createPlayer(video: any, autoPlay: boolean = false) {
    console.log(video.hls, video.type)
    const player = new Ctplayer({
      wrap: this.$refs.video,
      autoPlay,
      source: video.hls,
      type: video.type === 'h264' ? 'hls' : 'h265-hls',
      onTimeUpdate: (currentTime: number) => {
        if (this.currentVideo) {
          this.setCurrentTime(this.currentVideo, currentTime)
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
      }
    })
    return player
  }

  /**
   * 点击时间轴位置
   */
  private handleTimeline(e: any, video: any) {
    const scale = e.offsetX / e.target.clientWidth
    const position = Math.ceil(scale * video.duration)
    if (this.currentVideo !== video || !this.player) {
      this.currentVideo = video
      this.player && this.player.disposePlayer()
      this.player = this.createPlayer(video, true)
    }
    this.player.play()
    this.player.seek(position)
    this.setCurrentTime(video, position)
  }

  /**
   * 设置操作具柄在时间轴中的位置
   */
  private setCurrentTime(video: any, currentTime: number) {
    const currentTimestamp = video.startAt + currentTime
    this.currentTime = new Date(currentTimestamp)
    this.handlePos = this.scale(Math.round((currentTimestamp - this.currentDate) / 1000))
  }

  /**
   * 计算视频在时间轴中的位置
   */
  private calcVideoPosition(list: Array<any>) {
    return list.map((video: any) => {
      return {
        width: this.scale(video.duration + 1).toFixed(6),
        left: this.scale(Math.round((video.startAt - this.currentDate) / 1000)).toFixed(6),
        ...video
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
   * 播放录像（模态框）
   */
  private playReplay(video: any) {
    this.dialog.play = true
    this.currentListVideo = video
  }

  /**
   * 关闭播放录像弹出框
   */
  private closeReplayPlayer() {
    this.dialog.play = false
    this.currentListVideo = null
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
    min-width: 970px;
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
</style>
