<template>
  <div ref="video" class="video-wrap" @wheel="zoom" />
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
  @Prop()
  private url!: string
  @Prop({
    default: false
  })
  private autoPlay?: boolean
  @Prop({
    default: true
  })
  private hasControl?: boolean
  @Prop()
  private onTimeUpdate?: Function
  @Prop({
    default: false
  })
  private isLive?: boolean
  @Prop({
    default: false
  })
  private isZoom?: boolean

  public player?: Ctplayer
  private ratio = 1
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

  /**
   * 创建播放器
   */
  private createPlayer() {
    this.player = new Ctplayer({
      wrap: this.$refs.video,
      autoPlay: this.autoPlay,
      hasControl: this.hasControl,
      source: this.url,
      type: this.type,
      isLive: this.isLive,
      onTimeUpdate: this.onTimeUpdate,
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

  /**
   * 电子放大
   */
  private zoom(event: any) {
    const $video: any = this.$refs.video
    const player = $video.querySelector('video')
    // const videoSize = $video.getBoundingClientRect()
    // const playerSize = player.getBoundingClientRect()
    const deltaY = event.deltaY / 200
    this.ratio = this.ratio + this.ratio * deltaY
    if (this.ratio < 1) {
      this.ratio = 1
    }
    player.style.transform = `scale(${this.ratio})`
  }
}
</script>
