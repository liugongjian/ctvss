<template>
  <div ref="videoWrap" v-loading="waiting" class="video-wrap" :class="{'dragging': isDragging}">
    <div class="error">{{ error }}</div>
    <div ref="video" @wheel="zoom" @mousedown="mouseDownHandle($event)" @mouseup="mouseUpHandle($event)" />
    <div class="controls" :class="{'controls--large': hasProgress}">
      <div v-if="codec === 'h265'" class="controls__h265">
        <svg-icon name="h265" width="40px" height="22px" />
      </div>
      <div v-if="hasProgress && duration" ref="progress" class="controls__progress" :class="{'moving': progressMoveData.isStart}" @mousedown="progressHandle($event)">
        <div class="controls__progress__bar">
          <div class="controls__progress__buffered" :style="`width: ${bufferedRate}%`" />
          <div class="controls__progress__played" :style="`width: ${progressRate}%`" />
        </div>
      </div>
      <div class="controls__left">
        <template v-if="!isLive">
          <div v-if="paused" class="controls__btn controls__snapshot" @click="play">
            <svg-icon name="play" width="16px" height="16px" />
          </div>
          <div v-else class="controls__btn controls__snapshot" @click="pause">
            <svg-icon name="pause" width="18px" height="18px" />
          </div>
          <div v-if="hasProgress && duration" class="controls__time">{{ durationFormatInVideo(Math.floor(currentTime)) }} / {{ durationFormatInVideo(duration) }}</div>
        </template>
      </div>
      <div class="controls__right">
        <el-tooltip content="开启语音对讲" placement="top">
          <div class="controls__btn" :class="{'selected': isZoom}" @click.stop.prevent="toIntercom">
            <svg-icon name="micro" width="16px" height="16px" />
          </div>
        </el-tooltip>
        <div v-if="!isLive && codec !== 'h265'" class="controls__btn controls__playback">
          {{ playbackRate === 1 ? '倍速' : `${playbackRate}x` }}
          <ul class="controls__popup">
            <li
              v-for="rate in playbackRateList"
              :key="rate"
              :class="{'selected': rate === playbackRate}"
              @click="setPlaybackRate(rate)"
            >
              {{ rate }}x
            </li>
          </ul>
        </div>
        <el-tooltip :content="isZoom ? '关闭电子缩放' : '开启电子缩放'" placement="top">
          <div class="controls__btn controls__zoom" :class="{'selected': isZoom}" @click.stop.prevent="toggleZoom">
            <svg-icon name="zoom" width="16px" height="16px" />
          </div>
        </el-tooltip>
        <el-tooltip content="保存截图" placement="top">
          <div class="controls__btn controls__snapshot" @click.stop.prevent="snapshot">
            <svg-icon name="snapshot" width="18px" height="18px" />
          </div>
        </el-tooltip>
        <el-tooltip v-if="checkPermission(['ReplayRecord'])" content="录像回放" placement="top">
          <div v-if="isLive && hasPlayback" class="controls__btn controls__snapshot" @click.stop.prevent="playback">
            <svg-icon name="playback2" width="18px" height="18px" />
          </div>
        </el-tooltip>
        <el-tooltip content="播放实时监控" placement="top">
          <div v-if="!isLive && hasPlaylive" class="controls__btn controls__snapshot" @click.stop.prevent="playlive">
            <svg-icon name="ipc" width="18px" height="18px" />
          </div>
        </el-tooltip>
        <template v-if="hasFullscreen">
          <el-tooltip v-if="!isFullscreen" content="进入全屏" placement="top">
            <div class="controls__btn controls__fullscreen" @click.stop.prevent="fullscreen">
              <svg-icon name="fullscreen" width="15px" height="15px" />
            </div>
          </el-tooltip>
          <el-tooltip v-else content="退出全屏" placement="top">
            <div class="controls__btn controls__exit-fullscreen" @click.stop.prevent="exitFullscreen">
              <svg-icon name="exit-fullscreen" width="15px" height="15px" />
            </div>
          </el-tooltip>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import { createPlayer } from '../models/Ctplayer'
import { durationFormatInVideo } from '@/utils/date'
import { checkPermission } from '@/utils/permission'

@Component({
  name: 'Player'
})
export default class extends Vue {
  @Prop()
  private type!: string
  @Prop({
    default: 'player'
  })
  private playerId!: string
  /**
   * 视频地址
   */
  @Prop({
    default: ''
  })
  private url!: string
  /**
   * 视频编码
   */
  @Prop()
  private codec?: string
  /**
   * 自动播放
   */
  @Prop({
    default: false
  })
  private autoPlay?: boolean
  /**
   * 是否显示浏览器默认控制条
   */
  @Prop({
    default: true
  })
  private hasControl?: boolean
  /**
   * 是否显示回放按钮
   */
  @Prop({
    default: false
  })
  private hasPlayback?: boolean
  /**
   * 是否显示实时预览按钮
   */
  @Prop({
    default: false
  })
  private hasPlaylive?: boolean
  /**
   * 是否显示进度条
   */
  @Prop({
    default: false
  })
  private hasProgress?: boolean
  /**
   * 是否是实时预览视频
   */
  @Prop({
    default: false
  })
  private isLive?: boolean
  /**
   * 是否使用Websocket
   */
  @Prop({
    default: false
  })
  private isWs?: boolean
  /**
   * 是否支持全屏显示
   */
  @Prop({
    default: true
  })
  private hasFullscreen?: boolean
  /**
   * 是否全屏显示
   */
  @Prop({
    default: false
  })
  private isFullscreen?: boolean
  /**
   * 设备名称
   */
  @Prop()
  private deviceName?: string

  private checkPermission = checkPermission
  private isDragging: boolean = false
  public player?: any
  public paused?: boolean = true
  public waiting = false
  private isZoom = false
  private playbackRate = 1
  private playbackRateList = [16, 8, 4, 2, 1.5, 1, 0.5, 0.25]
  private videoMoveData: any = {
    x: null,
    y: null
  }
  private progressMoveData: any = {
    isStart: false,
    x: null,
    width: null
  }
  private duration = 0
  private currentTime = 0
  private buffered = 0
  private durationFormatInVideo = durationFormatInVideo
  private resizeObserver?: any
  private error = ''

  get username() {
    return UserModule.name
  }

  private get progressRate() {
    if (!this.currentTime) return 0
    return this.currentTime / this.duration * 100
  }

  private get bufferedRate() {
    if (!this.buffered) return 0
    return this.buffered / this.duration * 100
  }

  private mounted() {
    // TODO 泰州业务需求，将h265转成h264播放
    // if (this.username === 'tzszf' && this.type === 'h265-flv' && this.isLive) {
    //   const execRes: any = /\.[^\\.]+$/.exec(this.url)
    //   this.url = `${this.url.substring(0, execRes.index)}_264conv${execRes[0]}`
    //   this.type = 'flv'
    //   this.isWs = false
    // }
    this.createPlayer()
    if (this.isLive) document.addEventListener('visibilitychange', this.reloadPlayer)
  }

  private beforeDestroy() {
    this.disposePlayer()
    if (this.isLive) document.removeEventListener('visibilitychange', this.reloadPlayer)
    window.removeEventListener('resize', this.playerFS)
    if (this.resizeObserver) this.resizeObserver.disconnect()
  }

  @Watch('isZoom')
  getIsZoom(val: boolean) {
    if (!val) {
      // const $video: any = this.$refs.video
      // var player = $video.querySelector('video')
      const player = this.videoMoveData.player
      const mainBox = this.videoMoveData.mainBox
      if (this.type === 'h265-flv' || this.codec === 'h265') {
        // player = $video.querySelector('canvas')
        // if (this.codec === 'h265') {
        //   player = $video.querySelector('.player-box')
        // }
        // const mainBox: any = this.$refs.videoWrap
        this.playerFitSize(mainBox.clientWidth, mainBox.clientHeight, player)
      } else {
        player.style.width = ''
        player.style.height = ''
        player.style.top = ''
        player.style.left = ''
      }
    }
  }

  /**
   * 创建播放器
   */
  private createPlayer() {
    try {
      this.player = createPlayer({
        wrap: this.$refs.video,
        autoPlay: this.autoPlay,
        hasControl: this.hasControl,
        source: this.url,
        type: this.type,
        codec: this.codec,
        isLive: this.isLive,
        isWs: this.isWs,
        playbackRate: this.playbackRate,
        onTimeUpdate: this.onTimeUpdate,
        onDurationChange: this.onDurationChange,
        onBuffered: this.onBuffered,
        onLoadStart: this.onLoadStart,
        onCanplay: this.onCanplay,
        onEnded: this.onEnded,
        onPlay: this.setStatus,
        onPause: this.setStatus,
        onResizeScreen: (originWidth: number, originHeight: number) => {
          const $video: HTMLDivElement = this.$refs.video as HTMLDivElement
          const $canvas: HTMLCanvasElement | null = $video.querySelector('canvas')
          const videoSize = $video.getBoundingClientRect()
          const width = videoSize.width
          const height = videoSize.height
          if ($canvas) {
            const proportion = width / originWidth!
            $canvas.style.position = 'absolute'
            $canvas.style.transform = `scale(${proportion})`
            $canvas.style.transformOrigin = `top left`
            $canvas.style.top = (height - originHeight) / 2 * proportion + 'px'
          }
        },
        onReset: (player: any) => {
          if (this.player) {
            this.player.player = player
          }
        },
        onRetry: (params: any) => {
          if (this.isLive) {
            this.$emit('onRetry', params)
          }
        }
      })
      this.$nextTick(() => {
        const $video: any = this.$refs.video
        const mainBox: any = this.$refs.videoWrap
        var player = $video.querySelector('video')
        if (this.type === 'h265-flv' || this.codec === 'h265') {
          player = $video.querySelector('canvas')
          if (this.codec === 'h265') {
            player = $video.querySelector('.player-box')
          }
          this.playerFS()
          window.addEventListener('resize', this.playerFS, false)
          var targetNode = mainBox
          // @ts-ignore
          this.resizeObserver = new ResizeObserver(() => {
            this.playerFS()
          })
          this.resizeObserver.observe(targetNode)
        }
        this.videoMoveData.player = player
        this.videoMoveData.mainBox = mainBox
      })
    } catch (e) {
      this.error = e.message
    }
  }

  public playerFS() {
    const mainBox: any = this.$refs.videoWrap
    if (!mainBox) return
    var player = mainBox.querySelector('canvas')
    if (this.codec === 'h265') {
      player = mainBox.querySelector('.player-box')
    }
    this.playerFitSize(mainBox.clientWidth, mainBox.clientHeight, player)
  }

  public playerFitSize(width: number, height: number, player: any) {
    if (width / height > 16 / 9) {
      player.style.height = height + 'px'
      player.style.width = height * 16 / 9 + 'px'
    } else {
      player.style.width = width + 'px'
      player.style.height = width * 9 / 16 + 'px'
    }
    player.style.position = 'absolute'
    player.style.left = (width - player.clientWidth) / 2 + 'px'
    player.style.top = (height - player.clientHeight) / 2 + 'px'
  }

  public disposePlayer() {
    this.player && this.player.disposePlayer()
  }

  public reloadPlayer() {
    this.player && this.player.reloadPlayer()
  }

  public reset() {
    this.player && this.player.disposePlayer()
    this.createPlayer()
  }

  public setStatus() {
    this.paused = this.player?.player.paused
  }

  /**
   * 拖拽视频
   */
  public mouseDownHandle(event: any) {
    if (!this.isZoom) {
      return
    }
    const player = this.videoMoveData.player
    this.videoMoveData.x = event.pageX - player.offsetLeft
    this.videoMoveData.y = event.pageY - player.offsetTop
    event.currentTarget.style.cursor = 'move'
    this.isDragging = true
    window.onmousemove = this.mouseMoveHandle
  }

  public mouseMoveHandle(event: any) {
    const player = this.videoMoveData.player
    const mainBox = this.videoMoveData.mainBox
    let moveLeft = event.pageX - this.videoMoveData.x
    let moveTop = event.pageY - this.videoMoveData.y
    const mainBoxSize = mainBox.getBoundingClientRect()
    const playerSize = player.getBoundingClientRect()
    // 左右拖拽判断
    if (mainBox.clientWidth < player.clientWidth) {
      if (moveLeft > 0) {
        if (mainBoxSize.x - playerSize.x + moveLeft <= 0) {
          player.style.left = moveLeft + 'px'
        } else {
          player.style.left = '0px'
        }
      } else {
        if (playerSize.width + moveLeft >= mainBoxSize.width) {
          player.style.left = moveLeft + 'px'
        } else {
          player.style.left = mainBox.offsetWidth - player.offsetWidth + 'px'
        }
      }
    }
    // 上下拖拽判断
    if (mainBox.clientHeight < player.clientHeight) {
      if (moveTop > 0) {
        if (mainBoxSize.y - playerSize.y + moveTop <= 0) {
          player.style.top = moveTop + 'px'
        } else {
          player.style.top = '0px'
        }
      } else {
        if (playerSize.height + moveTop >= mainBoxSize.height) {
          player.style.top = moveTop + 'px'
        } else {
          player.style.top = mainBox.offsetHeight - player.offsetHeight + 'px'
        }
      }
      // 判断鼠标是否出框
      if (event.target.nodeName !== 'VIDEO' && event.target.nodeName !== 'CANVAS') {
        window.onmousemove = null
      }
    }
  }

  public mouseUpHandle(event: any) {
    if (!this.isZoom) {
      return
    }
    window.onmousemove = null
    event.currentTarget.style.cursor = 'move'
    this.isDragging = false
  }

  /**
   * 鼠标点击进度条
   */
  public progressHandle() {
    const $progress: any = this.$refs.progress
    const progressSize = $progress.getBoundingClientRect()
    this.progressMoveData.x = progressSize.left
    this.progressMoveData.width = progressSize.width
    this.progressMoveData.isStart = true
    window.addEventListener('mousemove', this.progressMouseMove)
    window.addEventListener('mouseup', this.progressMouseUp)
  }

  /**
   * 拖拽进度条
   */
  public progressMouseMove(event: MouseEvent) {
    if (!this.progressMoveData.isStart) return
    const offsetX = event.x - this.progressMoveData.x
    const rate = offsetX / this.progressMoveData.width
    const startTime = rate * this.duration
    this.progressSeek(startTime)
  }

  /**
   * 拖拽进度条后抬起鼠标
   */
  public progressMouseUp(event: MouseEvent) {
    this.progressMouseMove(event)
    this.progressMoveData.isStart = false
    window.removeEventListener('mousemove', this.progressMouseMove)
    window.removeEventListener('mouseup', this.progressMouseUp)
  }

  /**
   * 进度条跳转视频位置
   */
  public progressSeek(startTime: number) {
    this.currentTime = startTime
    this.seek(startTime)
  }

  /**
   * 电子放大
   */
  public zoom(event: any) {
    event.preventDefault()
    if (!this.isZoom) {
      return
    }
    const $videoWrap: any = this.$refs.videoWrap
    // var player = $videoWrap.querySelector('video')
    // if (this.type === 'h265-flv' || this.codec === 'h265') {
    //   player = $videoWrap.querySelector('canvas')
    //   if (this.codec === 'h265') {
    //     player = $videoWrap.querySelector('.player-box')
    //   }
    //   player.type = 'canvas'
    // }
    const player = this.videoMoveData.player
    const videoWrapSize = $videoWrap.getBoundingClientRect()
    let width
    let height
    let top
    let left
    if (event.deltaY < 0) {
      width = 1.1 * player.offsetWidth
      height = 1.1 * player.offsetHeight
      left = player.offsetLeft - 0.1 * event.offsetX
      top = player.offsetTop - 0.1 * event.offsetY
    } else {
      width = 0.9 * player.offsetWidth
      height = 0.9 * player.offsetHeight
      left = player.offsetLeft + 0.1 * event.offsetX
      top = player.offsetTop + 0.1 * event.offsetY
      if (width <= videoWrapSize.width && player.type !== 'canvas' && player.className !== 'player-box') {
        width = videoWrapSize.width
        height = videoWrapSize.height
        left = 0
        top = 0
      }
    }
    player.style.position = 'absolute'
    player.style.width = width + 'px'
    player.style.height = height + 'px'
    player.style.left = left + 'px'
    player.style.top = top + 'px'
    if ((player.type === 'canvas' || player.className === 'player-box') && width < videoWrapSize.width && height < videoWrapSize.height) {
      this.playerFitSize(videoWrapSize.width, videoWrapSize.height, player)
    }
  }

  /**
   * 播放
   */
  public play() {
    this.player!.play()
  }

  /**
   * 暂停
   */
  public pause() {
    this.player!.pause()
  }

  /**
   * 跳转
   */
  public seek(time: number) {
    this.player!.seek(time)
  }

  /**
   * Zoom开关
   */
  public toggleZoom() {
    this.isZoom = !this.isZoom
  }
  // 实时对讲
  public toIntercom() {
    if (window.navigator.mediaDevices) {
      window.navigator.mediaDevices
      // 获取浏览器麦克风权限
        .getUserMedia({ 'audio': true })
      // 用户同意赋予麦克风权限
        .then(() => {
          this.$emit('onIntercom')
        })
      // 用户拒绝麦克风权限，或者当前浏览器不支持
        .catch(e => {
          this.$message.error(`获取麦克风权限失败,原因：${e}`)
        })
    } else {
      this.$message.error('您当前浏览器或者浏览器版本暂不支持麦克风')
    }
  }

  /**
   * 视频截图
   */
  public snapshot() {
    this.player!.snapshot(this.deviceName)
  }

  /**
   * 播放结束
   */
  public onEnded() {
    this.$emit('onEnded')
  }

  /**
   * 时间戳变化
   */
  public onTimeUpdate(currentTime: number) {
    this.currentTime = currentTime
    this.$emit('onTimeUpdate', currentTime)
  }

  /**
   * 视频时长变化
   */
  public onDurationChange(duration: number) {
    this.duration = duration
  }

  /**
   * 视频缓冲时长变化
   */
  public onBuffered(buffered: number) {
    this.buffered = buffered
  }

  /**
   * 视频加载中
   */
  public onLoadStart() {
    this.$emit('onCanPlay', false)
    this.waiting = true
  }

  /**
   * 视频加载完成
   */
  public onCanplay() {
    this.waiting = false
    this.$emit('onCanPlay', true)
  }

  /**
   * 录像回放
   */
  public playback() {
    this.$emit('onPlayback')
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
    this.isZoom = false
  }

  /**
   * 退出全屏
   */
  public exitFullscreen() {
    this.$emit('onExitFullscreen')
    this.isZoom = false
  }

  /**
   * 切换播放速度
   */
  public setPlaybackRate(playbackRate: number) {
    this.playbackRate = playbackRate
    this.player!.setPlaybackRate(playbackRate)
    this.$emit('onSetPlaybackRate', playbackRate)
  }
}
</script>
<style lang="scss" scoped>
  .dragging {
    * {
      user-select:none;
    }
  }
  .video-wrap {
    position: relative;
    background: #000;
    overflow: hidden;
    ::v-deep .el-loading-mask {
      background: none !important;
      top: 50px;
      bottom: 50px;
      z-index: 10;
      .el-loading-spinner {
        margin-top: 0;
      }
    }
    ::v-deep .not-support {
      color: #fff;
      width: 100%;
      text-align: center;
      position: absolute;
      top: 50%;
    }
    .error {
      color: #fff;
      position: absolute;
      top: 50%;
      width: 100%;
      text-align: center;
    }
    ::v-deep .player-box {
      div{
        display: none !important;
      }
    }
    video, canvas {
      margin: auto;
      display: block;
    }
    .controls {
      * {
        user-select:none;
      }
      position: absolute;
      z-index: 15;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 35px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      opacity: 1;
      transition: opacity .2s;
      &__left, &__right {
        position: absolute;
        left: 10px;
        height: 100%;
        display: flex;
      }

      &__right {
        left: auto;
        right: 10px;
      }
      &__btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 4px;
        padding: 0 4px;
        height: 35px;
        font-size: 12px;
        cursor: pointer;
        .controls__popup {
          display: none;
          position: absolute;
          bottom: 34px;
          left: -10px;
          margin: 0;
          padding: 5px 0;
          min-width: 50px;
          list-style: none;
          background: rgba(0, 0, 0, 0.7);
          li {
            margin: 0;
            padding: 5px 15px;
            list-style: none;
            &:hover {
              background: #444;
            }
            &.selected {
              color: $primary;
            }
          }
        }
        &:hover {
          .controls__popup {
            display: block;
          }
        }
        &.selected {
          color: $primary;
        }
      }
      &__playback {
        width: 32px;
        li {
          text-align: center;
        }
      }
      &__stream {
        .controls__popup {
          width: 80px;
          left: -30px;
          li {
            text-align: center;
          }
        }
      }
      &__time {
        line-height: 35px;
        margin-left: 10px;
      }
      &__progress {
        position: absolute;
        width: 100%;
        top: -13px;
        height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;
        &__bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
        }
        &__buffered {
          position: absolute;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          transition: width 100ms;
        }
        &__played {
          position: absolute;
          height: 4px;
          background: $lightGray;
          &::after {
            content: ' ';
            position: absolute;
            width: 12px;
            height: 12px;
            background: $lightGray;
            border-radius: 100%;
            right: -5px;
            top: -4px;
            opacity: 0;
            transition: opacity 100ms;
          }
        }
        &:hover, &.moving {
          .controls__progress__played::after {
            opacity: 1;
          }
        }
      }
      &__h265 {
        position: absolute;
        top: -25px;
        right: 10px;
        opacity: 0.7;
      }
    }
    .controls--large {
      height: 55px;
      padding-top: 10px;
    }
    &:hover {
      .controls {
        opacity: 1;
      }
    }
  }
</style>
