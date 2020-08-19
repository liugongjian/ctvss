<template>
  <div ref="video" class="video-wrap" />
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Ctplayer from '@/utils/player'

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
  @Prop()
  private onTimeUpdate?: Function

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
    this.player && this.player.reloadPlayer()
  }

  /**
   * 创建播放器
   */
  private createPlayer() {
    this.player = new Ctplayer({
      wrap: this.$refs.video,
      autoPlay: this.autoPlay,
      source: this.url,
      type: this.type,
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
      }
    })
  }
}
</script>
