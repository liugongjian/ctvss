<template>
  <div class="video-wrap">
    <div ref="video" @wheel="zoom" />
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
import { Component, Vue, Prop } from 'vue-property-decorator'
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
  @Prop({
    default: false
  })
  private isZoom?: boolean
  @Prop()
  private deviceName?: string
  @Prop()
  private onTimeUpdate?: Function
  @Prop()
  private onEnded?: Function

  public player?: Ctplayer
  public paused?: boolean = true
  private ratio = 1
  private playbackRate = 1
  private playbackRateList = [16, 8, 4, 2, 1.5, 1, 0.5]
  private offset: any = {
    x: 0,
    y: 0
  }

  private mounted() {
    this.createPlayer()
    if (this.isLive) window.addEventListener('focus', this.reloadPlayer)
  }

  private beforeDestroy() {
    this.disposePlayer()
    if (this.isLive) window.removeEventListener('focus', this.reloadPlayer)
  }

  /**
   * 创建播放器
   */
  private createPlayer() {
    this.url = this.isWs ? this.url.replace('http://', 'ws://') : this.url
    this.player = new Ctplayer({
      wrap: this.$refs.video,
      autoPlay: this.autoPlay,
      hasControl: this.hasControl,
      source: this.url,
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
   * 电子放大
   */
  public zoom(event: any) {
    const $video: any = this.$refs.video
    const player = $video.querySelector('video')
    // const videoSize = $video.getBoundingClientRect()
    // const playerSize = player.getBoundingClientRect()
    const deltaY = -event.deltaY / 200
    this.ratio = this.ratio + this.ratio * deltaY
    if (this.ratio < 1) {
      this.ratio = 1
    }
    player.style.transform = `scale(${this.ratio})`
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
