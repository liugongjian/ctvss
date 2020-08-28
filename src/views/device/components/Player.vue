<template>
  <div ref="video" class="video-wrap" />
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

  public player?: Ctplayer

  private mounted() {
    this.createPlayer()
  }

  private beforeDestroy() {
    this.disposePlayer()
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
}
</script>
