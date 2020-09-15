<template>
  <div ref="videoWrap" class="video-wrap">
    <div ref="video" @wheel="zoom" @mousedown="mouseDownHandle($event)" @mouseup="mouseUpHandle($event)" />
    <div class="controls">
      <div class="controls__left">
        <template v-if="!isLive">
          <div v-if="paused" class="controls__btn controls__snapshot" @click="play">
            <svg-icon name="play" width="16px" height="16px" />
          </div>
          <div v-else class="controls__btn controls__snapshot" @click="pause">
            <svg-icon name="pause" width="18px" height="18px" />
          </div>
        </template>
      </div>
      <div class="controls__right">
        <div v-if="!isLive" class="controls__btn controls__playback">
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
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import Ctplayer from '../models/Ctplayer'

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
  @Prop({
    default: ''
  })
  private url!: string
  @Prop({
    default: false
  })
  private autoPlay?: boolean
  @Prop({
    default: true
  })
  private hasControl?: boolean
  @Prop({
    default: false
  })
  private isLive?: boolean
  @Prop({
    default: false
  })
  private isWs?: boolean
  @Prop()
  private deviceName?: string
  @Prop()
  private onTimeUpdate?: Function
  @Prop()
  private onEnded?: Function

  public player?: Ctplayer
  public paused?: boolean = true
  private isZoom = false
  private ratio = 1
  private playbackRate = 1
  private playbackRateList = [16, 8, 4, 2, 1.5, 1, 0.5]
  private offset: any = {
    x: 0,
    y: 0
  }
  private moveData: any = {
    x: null,
    y: null
  }

  private mounted() {
    this.createPlayer()
    if (this.isLive) window.addEventListener('focus', this.reloadPlayer)
  }

  private beforeDestroy() {
    this.disposePlayer()
    if (this.isLive) window.removeEventListener('focus', this.reloadPlayer)
  }

  @Watch('isZoom')
  getIsZoom(val: boolean) {
    if (!val) {
      const $video: any = this.$refs.video
      const player = $video.querySelector('video')
      player.style.width = ''
      player.style.height = ''
      player.style.top = ''
      player.style.left = ''
    }
  }

  /**
   * 创建播放器
   */
  private createPlayer() {
    const source = this.isWs ? this.url.replace('http://', 'ws://') : this.url
    this.player = new Ctplayer({
      wrap: this.$refs.video,
      autoPlay: this.autoPlay,
      hasControl: this.hasControl,
      source,
      type: this.type,
      isLive: this.isLive,
      playbackRate: this.playbackRate,
      onTimeUpdate: this.onTimeUpdate,
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
      onRetry: () => {
        if (this.isLive) {
          this.$emit('onRetry')
        }
      }
    })
  }

  public disposePlayer() {
    this.player && this.player.disposePlayer()
  }

  public reloadPlayer() {
    console.log('reloadPlayer')
    this.player && this.player.reloadPlayer()
  }

  public reset() {
    this.player && this.player.disposePlayer()
    this.createPlayer()
  }

  public setStatus() {
    this.paused = this.player!.player.paused
  }

  /**
   * 拖拽
   */
  public mouseDownHandle(event: any) {
    if (!this.isZoom) {
      return
    }
    const $video: any = this.$refs.video
    const player = $video.querySelector('video')
    this.moveData.x = event.pageX - player.offsetLeft
    this.moveData.y = event.pageY - player.offsetTop
    event.currentTarget.style.cursor = 'move'
    window.onmousemove = this.mouseMoveHandle
  }

  public mouseMoveHandle(event: any) {
    const $video: any = this.$refs.video
    const player = $video.querySelector('video')
    const mainBox: any = this.$refs.videoWrap
    let moveLeft = event.pageX - this.moveData.x
    let moveTop = event.pageY - this.moveData.y
    const mainBoxSize = mainBox.getBoundingClientRect()
    const playerSize = player.getBoundingClientRect()
    // 左右拖拽判断
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
    // 上下拖拽判断
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
    if (event.target.nodeName !== 'VIDEO') {
      window.onmousemove = null
    }
  }

  public mouseUpHandle(event: any) {
    if (!this.isZoom) {
      return
    }
    window.onmousemove = null
    event.currentTarget.style.cursor = 'move'
  }

  /**
   * 电子放大
   */
  public zoom(event: any) {
    if (!this.isZoom) {
      return
    }
    const $videoWrap: any = this.$refs.videoWrap
    const player = $videoWrap.querySelector('video')
    const videoWrapSize = $videoWrap.getBoundingClientRect()
    const playerSize = player.getBoundingClientRect()
    const deltaY = event.deltaY / 2000
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
      if (width <= videoWrapSize.width) {
        width = videoWrapSize.width
        height = videoWrapSize.height
        left = 0
        top = 0
      }
    }
    player.style.width = width + 'px'
    player.style.height = height + 'px'
    player.style.left = left + 'px'
    player.style.top = top + 'px'
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

  /**
   * 视频截图
   */
  public snapshot() {
    this.player!.snapshot(this.deviceName)
  }

  /**
   * 切换播放速度
   */
  public setPlaybackRate(playbackRate: number) {
    this.playbackRate = playbackRate
    this.player!.setPlaybackRate(playbackRate)
  }
}
</script>
<style lang="scss" scoped>
  .video-wrap {
    position: relative;
    background: #333;
    overflow: hidden;

    video {
      display: block;
    }
    .controls {
      * {
        user-select:none;
      }
      position: absolute;
      z-index: 10;
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
        margin: 0 8px;
        height: 35px;
        font-size: 12px;
        cursor: pointer;
        .controls__popup {
          display: none;
          position: absolute;
          bottom: 35px;
          left: -10px;
          margin: 0;
          padding: 5px 0;
          min-width: 50px;
          list-style: none;
          background: rgba(0, 0, 0, 0.7);
          li {
            margin: 0;
            padding: 5px 10px;
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
        li {
          text-align: center;
        }
      }
    }
    &:hover {
      .controls {
        opacity: 1;
      }
    }
  }
</style>
