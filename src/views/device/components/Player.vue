<template>
  <div ref="videoWrap" v-loading="waiting" class="video-wrap" :class="{'dragging': isDragging}">
    <div class="error">{{ error }}</div>
    <div ref="video" class="video-ref" @wheel="zoom" @mousedown="mouseDownHandle($event)" @mouseup="mouseUpHandle($event)" />
    <div v-if="showCanvasBox" class="canvasScaleBox"><canvas /></div>
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
      <div v-if="!isHiddenTools" class="controls__right">
        <div v-if="hasAudio && !waiting" class="controls__btn controls__playback volume">
          <span @click="switchMuteStatus">
            <svg-icon v-if="volume === 0 || isMute" name="mute" width="18px" height="18px" />
            <svg-icon v-else name="volume" width="18px" height="18px" />
          </span>
          <div v-if="codec !== 'h265'" class="controls__popup controls__volume">
            <el-slider
              :value="volume"
              :show-tooltip="false"
              class="volume"
              vertical
              height="165px"
              @input="setPlayVolume"
            />
          </div>
        </div>
        <div v-else class="controls__btn kill__volume">
          <svg-icon name="mute" class="mute_gray" width="18px" height="18px" />
        </div>
        <div v-if="ifCanRTC && codec !== 'h265'" class="controls__btn controls__playback">
          {{ videoType }}
          <ul class="controls__popup">
            <li :class="{'selected': videoType === 'FLV'}" @click.stop.prevent="(e) => getVideoType(e,'FLV')">
              FLV
            </li>
            <li :class="{'selected': videoType === 'RTC'}" @click.stop.prevent="(e) => getVideoType(e,'RTC')">
              RTC
            </li>
          </ul>
        </div>
        <el-tooltip v-if="inProtocol === 'gb28181'" content="开启语音对讲" placement="top">
          <div v-if="isLive" class="controls__btn controls__snapshot" @click.stop.prevent="toIntercom">
            <svg-icon name="micro" width="18px" height="18px" />
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
        <el-tooltip v-if="isLive && inProtocol === 'gb28181'" placement="top" :content="showCanvasBox ? '关闭云台局部缩放' : '云台局部缩放(需设备侧支持)'">
          <div class="controls__btn controls__snapshot videoTypeBtn" :class="{'selected': showCanvasBox}" @click.stop.prevent="changeScaleCanvas">
            <svg-icon name="screenscale" width="18px" height="18px" />
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
        <div class="controls__btn controls__playback">
          <svg-icon name="screenratio" width="18px" height="18px" />
          <ul class="controls__popup videoScaleBox">
            <li
              v-for="item in scaleKind"
              :key="item.kind"
              :class="{'selected': scaleVal === item.kind}"
              @click.stop.prevent="(e) => scaleVideo(e,item.kind)"
            >
              {{ item.label }}
            </li>
          </ul>
        </div>
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
import { Component, Vue, Prop, Watch, Inject } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import { createPlayer } from '../models/Ctplayer'
import { durationFormatInVideo } from '@/utils/date'
import { checkPermission } from '@/utils/permission'
import { scaleKind } from '@/dics/index'
import { dragCanvasZoom } from '@/api/device'
import { ifWebRTC } from '@/utils/browser'

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

  // 视频流全部address
  @Prop()
  private allAddress?: any
  // inProtocol
  @Prop() private inProtocol?: string
  @Prop() private deviceId?: number | string
  @Prop() private videoInfo?: string
  @Prop() private scaleStatus?: boolean
  /**
   * 隐藏视频工具栏
   */
  @Inject('hideTools') private hideTools: Function
  @Prop({
    default: 30
  }) private defaultVolume?: number

  private checkPermission = checkPermission
  private isDragging: boolean = false
  public player?: any
  public hasAudio: boolean = true
  public paused?: boolean = true
  public isMute?: boolean = this.codec === 'h265'
  public waiting = false
  private isZoom = false
  private playbackRate = 1
  private volume: number = 0
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
  private videoType = ''
  private ifCanRTC = false

  private scaleKind = scaleKind
  private scaleVal = ''
  private showCanvasBox = false
  private canvasShape: any = {}
  private oCanvas: any
  private ctxShape: any
  private ctxDrawState = false
  private oCanvasWidth?: number
  private oCanvasHeight?: number
  private userScaleConfig: any
  private isHiddenTools: boolean = false
  private ifMountedMute?: boolean = false

  get username() {
    return UserModule.name
  }

  @Watch('defaultVolume')
  private onDefaultVolumeChanged() {
    this.volume = this.defaultVolume
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
    // 初始化状态
    this.volume = this.defaultVolume

    if (!this.allAddress || !this.allAddress.comefrom || this.allAddress.comefrom !== 'bugger') {
      this.getVideoType()
    }
    this.getUserScaleConfig()
    this.createPlayer()
    this.setPlayVolume(this.volume)
    if (this.volume === 0) {
      this.ifMountedMute = true
    } else {
      this.ifMountedMute = false
    }
    if (this.isLive) document.addEventListener('visibilitychange', this.reloadPlayer)
  }

  private getVideoType(eve: any = '', kind: any = '') {
    if (eve) {
      eve.currentTarget.blur()
    }

    if (!kind) {
      if (ifWebRTC() && this.allAddress && this.allAddress.webrtcUrl) {
        // this.videoType = 'RTC'
        this.ifCanRTC = true
      } else {
        // this.videoType = 'FLV'
        this.ifCanRTC = false
      }
      this.videoType = this.type.toUpperCase()
    } else {
      this.videoType = kind
      this.disposePlayer()
      const $video: any = this.$refs.video
      $video.innerHtml = ''
      this.$nextTick(() => {
        this.createPlayer()
      })
    }
    this.$emit('onTypeChange', this.videoType)
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
        // player.style.width = ''
        // player.style.height = ''
        // player.style.top = ''
        // player.style.left = ''
        this.playerFitSize(mainBox.clientWidth, mainBox.clientHeight, player)
      }
    }
  }
  @Watch('scaleStatus')
  getScaleStatus(val: boolean) {
    this.showCanvasBox = val
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
        volume: this.volume,
        allAddress: this.allAddress,
        videoType: this.videoType,
        onTimeUpdate: this.onTimeUpdate,
        onDurationChange: this.onDurationChange,
        onBuffered: this.onBuffered,
        onLoadStart: this.onLoadStart,
        onCanplay: this.onCanplay,
        onEnded: this.onEnded,
        onPlay: this.setStatus,
        onPause: this.setStatus,
        onVolumeChange: this.onVolumeChange,
        onTestHasAudio: this.onTestHasAudio,
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
        const $video = this.$refs.video as HTMLDivElement
        const mainBox: any = this.$refs.videoWrap
        let player: any
        if (this.codec === 'h265') {
          player = $video.querySelector('.player-box')
        } else {
          player = $video.querySelector('video')
        }
        this.playerFS()
        window.addEventListener('resize', this.playerFS, false)
        const targetNode = mainBox
        // 监听video-wrap
        // @ts-ignore
        this.resizeObserver = new ResizeObserver(() => {
          this.playerFS()
          const mainBox: any = this.$refs.videoWrap
          // 针对小屏幕隐藏工具栏
          if (mainBox.clientHeight < 100 || mainBox.clientWidth < 300) {
            this.isHiddenTools = true
          } else {
            this.isHiddenTools = false
          }
        })
        this.resizeObserver.observe(targetNode)
        this.videoMoveData.player = player
        this.videoMoveData.mainBox = mainBox
      })
    } catch (e) {
      this.error = e.message
    }
  }

  public getUserScaleConfig() {
    const userScaleConfig: Array<any> = this.$store.state.user.userConfigInfo || []
    const scaleInfo = userScaleConfig.find((item: any) => item.key === 'videoScale')
    const scaleNum = scaleInfo ? scaleInfo.value : '-1'
    this.userScaleConfig = scaleNum
  }

  public playerFS() {
    const mainBox: any = this.$refs.videoWrap
    if (this.codec === 'h265') {
      if (!mainBox) return
      const player = mainBox.querySelector('.player-box')
      player.style.height = `${mainBox.clientHeight - 40}px`
      this.playerFitSize(mainBox.clientWidth, mainBox.clientHeight, player)
    } else {
      const $video: any = this.$refs.video
      if (!$video) return
      const player = $video.querySelector('video')
      this.playerFitSize(mainBox.clientWidth, mainBox.clientHeight, player)
    }
  }

  public playerFitSize(width: number, height: number, player: any) {
    const videoContain = this.codec === 'h265' ? player.querySelector('canvas') : player

    // 替代eval，计算字符串
    const replaceEvalByFunction = (obj: any) => {
      return window.Function('"use strict";return (' + obj + ')')()
    }

    let thisScale = ''

    if (this.scaleVal) {
      thisScale = this.scaleVal
    } else if (this.userScaleConfig > 0) {
      const scaleValue = this.scaleKind.find((item: any) => item.num === this.userScaleConfig)
      thisScale = scaleValue.kind
      this.scaleVal = scaleValue.kind
    } else {
      thisScale = 'fit'
      this.scaleVal = 'fit'
    }
    switch (thisScale) {
      case '16 / 9':
      case '4 / 3':
        {
          const tempScale = replaceEvalByFunction(this.scaleVal)
          if (width / height > tempScale) {
            player.style.height = '100%'
            player.style.width = height * tempScale + 'px'
          } else {
            player.style.width = '100%'
            player.style.height = width * (1 / tempScale) + 'px'
          }
          videoContain.style.objectFit = 'initial'
        }
        break
      case 'normal':
        player.style.height = `${height}px`
        player.style.width = `${width}px`
        videoContain.style.objectFit = 'contain'
        break
      case 'fit':
        player.style.height = `${height}px`
        player.style.width = `${width}px`
        videoContain.style.objectFit = 'fill'
        break
      default:
        // if (width / height > 16 / 9) {
        //   player.style.height = '100%'
        //   player.style.width = height * 16 / 9 + 'px'
        // } else {
        //   player.style.width = '100%'
        //   player.style.height = width * 9 / 16 + 'px'
        // }
        // videoContain.style.objectFit = 'initial'
        player.style.height = `${height}px`
        player.style.width = `${width}px`
        videoContain.style.objectFit = 'fill'
        break
    }
    // if (width / height > 16 / 9) {
    //   player.style.height = '100%'
    //   player.style.width = height * 16 / 9 + 'px'
    // } else {
    //   player.style.width = '100%'
    //   player.style.height = width * 9 / 16 + 'px'
    // }
    player.style.left = (width - player.clientWidth) / 2 + 'px'
    player.style.top = (height - player.clientHeight) / 2 + 'px'
  }

  public changeScaleCanvas() {
    this.showCanvasBox = !this.showCanvasBox
    this.isZoom = false
    this.$emit('onChangeScalePTZStatus', this.showCanvasBox)
    if (this.showCanvasBox) {
      let player: any, ctxBox: any
      if (this.codec === 'h265') {
        ctxBox = this.$refs.videoWrap
        player = ctxBox.querySelector('.player-box')
      } else {
        ctxBox = this.$refs.video
        player = ctxBox.querySelector('video')
      }
      this.$nextTick(() => {
        const oDom = document.querySelector('.canvasScaleBox')
        this.oCanvas = oDom.querySelector('canvas')
        this.oCanvas.style.cursor = 'crosshair'
        this.oCanvas.style.width = `${player.clientWidth}px`
        this.oCanvas.style.height = `${player.clientHeight}px`
        this.oCanvasWidth = player.clientWidth
        this.oCanvasHeight = player.clientHeight
        this.oCanvas.style.position = 'absolute'
        this.oCanvas.style.left = `${(ctxBox.clientWidth - player.clientWidth) / 2}px`
        this.oCanvas.style.top = `${(ctxBox.clientHeight - player.clientHeight) / 2}px`
        this.ctxShape = this.oCanvas.getContext('2d')
        this.oCanvas.addEventListener('mousedown', (e) => { this.canvasMouseDown(e) })
        this.oCanvas.addEventListener('mousemove', (e) => { this.canvasMouseMove(e) })
        this.oCanvas.addEventListener('mouseup', (e) => { this.canvasMouseUp(e) })
        this.oCanvas.addEventListener('mouseleave', (e) => { this.canvasMouseleave(e) })
        this.oCanvas.addEventListener('click', (e) => { this.canvasClickHandle(e) })
      })
    } else {
      this.removeListener()
    }
  }

  // 解绑canvas缩放事件
  private removeListener() {
    this.oCanvas.removeEventListener('mousedown', (e) => { this.canvasMouseDown(e) })
    this.oCanvas.removeEventListener('mousemove', (e) => { this.canvasMouseMove(e) })
    this.oCanvas.removeEventListener('mouseup', (e) => { this.canvasMouseUp(e) })
    this.oCanvas.removeEventListener('mouseleave', (e) => { this.canvasMouseleave(e) })
    this.oCanvas.removeEventListener('click', (e) => { this.canvasClickHandle(e) })
  }

  // 获取canvas 点坐标
  private getCanvasMousePos(e: any) {
    // e.clientX, e.clientY
    const {
      x: canvasClientX, y: canvasClientY, width, height, left, top
    } = this.oCanvas?.getBoundingClientRect()

    // const ratio = window.devicePixelRatio
    //   const devide = (point:number) => point / ratio

    const pointX = (e.clientX - left) * this.oCanvas.width / width
    const pointY = (e.clientY - top) * this.oCanvas.height / height
    const curPoint = [ pointX, pointY ]
    // 超出边界
    if (pointX > canvasClientX + width || pointX < 0) {
      return false
    }
    if (pointY > canvasClientY + height || pointY < 0) {
      return false
    }
    return curPoint
  }
  // 画矩形
  private drawRect() {
    if (this.oShape && Object.keys(this.oShape).length > 0) {
      this.ctxShape.clearRect(0, 0, this.oCanvasWidth, this.oCanvasHeight)// 清除画板
      this.ctxShape.strokeStyle = '#FFFFFF'
      // this.ctxShape.lineCap = 'square'
      this.ctxShape.lineWidth = 1
      this.ctxShape.beginPath()
      this.ctxShape.rect(Math.floor(this.oShape.startX) + 0.5, this.oShape.startY, Math.floor(this.oShape.endX - this.oShape.startX) + 0.5,
        Math.floor(this.oShape.endY - this.oShape.startY) + 0.5)
      this.ctxShape.stroke()
      // this.ctxShape.strokeRect(Math.floor(devide(this.oShape.startX)), Math.floor(devide(this.oShape.startY)), this.oShape.endX - this.oShape.startX,
      //   this.oShape.endY - this.oShape.startY)
      this.ctxShape.closePath()
    }
  }

  private canvasClickHandle(e: any) {
    const mousePos = this.getCanvasMousePos(e)
    if (!mousePos) return
    const [x, y] = mousePos
    if (x === this.oShape.startX && y === this.oShape.startY) {
      this.oShape = {}
      this.ctxShape.clearRect(0, 0, this.oCanvasWidth, this.oCanvasHeight)// 清除画板
      this.ctxDrawState = false
      this.removeListener()
    }
  }

  private canvasMouseDown(e: any) {
    e.stopPropagation()
    const mousePos = this.getCanvasMousePos(e)
    if (!mousePos) return
    const [x, y] = mousePos
    if (!this.iShape || Object.keys(this.oShape).length === 0) {
      this.ctxDrawState = true
      this.oShape = {
        startX: x,
        startY: y
      }
    }
  }

  private canvasMouseMove(e: any) {
    e.stopPropagation()
    if (this.oShape && this.ctxDrawState) {
      const mousePos = this.getCanvasMousePos(e)
      if (!mousePos) {
        this.removeListener()
        return
      }
      const [x, y] = mousePos
      // 鼠标结束的位置
      this.oShape.endX = x
      this.oShape.endY = y
      this.drawRect()
    }
  }

  private canvasMouseUp(e: any) {
    e.stopPropagation()
    // TODO 鼠标移入黑色区域，取消画框
    const mousePos = this.getCanvasMousePos(e)
    if (!mousePos) return
    // const [x, y] = mousePos
    const { startX, startY, endX, endY } = this.oShape
    const { Width = 0, Height = 0 } = this.videoInfo ? JSON.parse(this.videoInfo) : {}

    if (!endX || !endY) {
      return
    }

    const tempRatioWidth = this.oCanvas.width / Width
    const tempRatioHeight = this.oCanvas.height / Height

    const lengthX = Math.round(Math.abs(endX - startX) / tempRatioWidth).toString()
    const lengthY = Math.round(Math.abs(endY - startY) / tempRatioHeight).toString()
    const midPointX = Math.round((endX + startX) / 2 / tempRatioWidth).toString()
    const midPointY = Math.round((endY + startY) / 2 / tempRatioHeight).toString()
    const command = endX > startX ? 'zoomIn' : 'zoomOut'

    this.oShape = {}
    this.ctxShape.clearRect(0, 0, this.oCanvasWidth, this.oCanvasHeight)// 清除画板
    this.removeListener()
    this.ctxDrawState = false

    const param = {
      deviceId: this.deviceId,
      command,
      length: Width.toString(), // 信令侧要求左右为length，上下为width
      width: Height.toString(),
      midPointX,
      midPointY,
      lengthX,
      lengthY
    }
    if (lengthX !== '0' || lengthY !== '0') {
      dragCanvasZoom(param).then(() => {
        this.$message.success('请等待设备调整角度')
        this.showCanvasBox = false
        this.oCanvas.style.cursor = 'auto'
      }).catch(err => {
        this.$message.error(err)
        this.showCanvasBox = false
        this.oCanvas.style.cursor = 'auto'
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public canvasMouseleave(e: any) {
    if (this.oShape && Object.keys(this.oShape).length > 0) {
      this.oShape = {}
      this.ctxShape.clearRect(0, 0, this.oCanvasWidth, this.oCanvasHeight)// 清除画板
      this.ctxDrawState = false
    }
    this.removeListener()
  }

  public disposePlayer() {
    this.player && this.player.disposePlayer()
  }

  public reloadPlayer() {
    // 如果是webrtc协议不重新加载播放器
    if (this.type !== 'rtc' && this.videoType !== 'RTC') { // TODO: 待重构
      this.player && this.player.reloadPlayer()
      this.playerFS()
    }
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
   * 开关静音状态
   */
  public switchMuteStatus() {
    if (this.ifMountedMute) { // 缓存为静音或者声音为0的视频时，静音按键点击无效，增加修改声音为30
      this.player!.switchMuteStatus(false)
      this.volume = 30
      this.isMute = true
      this.player!.setPlayVolume(30)
      this.ifMountedMute = false
    } else {
      this.player!.switchMuteStatus(!this.isMute) // 处理--缓存的是有声音的视频，点击静音按键无效。
      if (this.isMute) {
        this.volume = 30
        this.player!.setPlayVolume(30)
      } else {
        this.volume = 0
        this.player!.setPlayVolume(0)
      }
    }
  }

  /**
   * Zoom开关
   */
  public toggleZoom() {
    this.isZoom = !this.isZoom
    this.showCanvasBox = false
  }
  // 实时对讲
  public toIntercom(event: any) {
    event.currentTarget.blur()
    if (window.navigator.mediaDevices) {
      window.navigator.mediaDevices
      // 获取浏览器麦克风权限
        .getUserMedia({ 'audio': true })
      // 用户同意赋予麦克风权限
        .then(() => {
          this.$emit('onIntercom', this.videoType)
        })
      // 用户拒绝麦克风权限，或者当前浏览器不支持
        .catch(e => {
          switch (e.message || e.name) {
            case 'PERMISSION_DENIED':
            case 'PermissionDeniedError':
              this.$message.error('用户拒绝提供权限')
              break
            case 'NOT_SUPPORTED_ERROR':
            case 'NotSupportedError':
              this.$message.error('浏览器不支持您当前选择的设备')
              break
            case 'MANDATORY_UNSATISFIED_ERROR':
            case 'MandatoryUnsatisfiedError':
              this.$message.error('无法发现指定的硬件设备')
              break
            default:
              this.$message.error(`无法打开麦克风,原因：${e.code || e.name}`)
          }
        })
    } else {
      this.$message.error('您当前浏览器或者协议暂不支持麦克风')
    }
  }

  // 视频缩放
  public scaleVideo(event: any, kind: any) {
    event.currentTarget.blur()
    this.scaleVal = kind
    this.playerFS()
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
    this.waiting = true
  }

  /**
   * 视频加载完成
   */
  public onCanplay() {
    this.waiting = false
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
    this.showCanvasBox = false
    this.hideTools()
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

  /**
   * 控制音量
   */
  public setPlayVolume(volume: number) {
    // h264拖动音量后解除静音
    this.codec !== 'h265' && volume && this.isMute && this.player!.switchMuteStatus(false)
    // 调用的是 每个 player 绑定到 baseplayer 里的方法 & this.player 是 baseplayer
    !this.isMute && this.player!.setPlayVolume(volume)
  }

  /**
   * 音轨判断、音量调整
   */
  public onVolumeChange(volume: number, isMute: boolean) {
    // 判断视频数据已加载完成，HTMLMediaElement.readyState = 4 时才触发音量变化，不然播放器初始化时会将音量设为0
    if (this.player.player.readyState === 4) {
      this.isMute = isMute
      if (isMute) {
        this.volume = 0
      } else {
        this.volume = volume * 100
      }
      this.$emit('onVolumeChange', this.volume)
    }
  }

  /**
   * 判断是否包含音轨
   */
  public onTestHasAudio(hasAudio: boolean) {
    this.hasAudio = hasAudio
  }
}
</script>
<style lang="scss" scoped>
  .volume {
    margin-top: 10px;
    margin-bottom: 10px;
    color: aliceblue;
    ::v-deep .el-slider.is-vertical .el-slider__runway {
      margin: 0px auto;
      background-color: gray;
    }
    ::v-deep .el-slider__bar{
      background-color: aliceblue;
    }
  }
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
    .video-ref {
      height: 100%;
      display: flex;
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
    .mute_gray {
      opacity: 0.4;
      color: aliceblue;
    }
    .kill__volume {
      cursor: not-allowed !important; //优先级
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
        margin: 0 3px;
        padding: 0 4px;
        height: 35px;
        font-size: 12px;
        cursor: pointer;
        .controls__popup {
          display: none;
          position: absolute;
          bottom: 34px;
          left: -10px;
          margin: auto 0;
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
        .controls__volume {
          left: -3px;
          min-width: 35px;
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
    .videoTypeBtn {
      color: #fff;
    }
  }
  .videoScaleBox {
    width: 80px;
  }
  .canvasScaleBox{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height:100%;
  }
</style>
