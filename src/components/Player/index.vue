<template>
  <div class="player__wrap">
    <div class="header">
      <div class="header__left">
        <slot name="headerLeft" />
      </div>
      <div class="header__right">
        <slot name="headerRight" />
      </div>
    </div>
    <div class="player__border">
      <div ref="playerContainer" class="player__container" />
    </div>
    <slot name="container" />
    <div v-if="player" id="control" class="control" :class="{'control--large': hasProgress}">
      <slot name="controlBody" />
      <Progress v-if="hasProgress" />
      <div class="control__left">
        <template v-if="!isLive">
          <PlayPause />
          <Timer v-if="hasProgress" />
        </template>
      </div>
      <More class="control__more" />
      <div class="control__right">
        <Volume />
        <PlaybackRate v-if="!isLive && codec !== 'h265'" />
        <slot name="controlRight" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'vue-property-decorator'
import { createPlayer } from './models/PlayerFactory'
import { PlayerType } from './models/Player.d'
import { Player } from './models/Player'
import './styles/index.scss'
/**
 * 子组件库
 */
import PlayPause from './compontents/PlayPause.vue'
import Timer from './compontents/Timer.vue'
import Volume from './compontents/Volume.vue'
import PlaybackRate from './compontents/PlaybackRate.vue'
import Progress from './compontents/Progress.vue'
import More from './compontents/More.vue'

@Component({
  name: 'Player',
  components: {
    PlayPause,
    Timer,
    Volume,
    PlaybackRate,
    Progress,
    More
  }
})
export default class extends Vue {
  /* 播放器类型 */
  @Prop()
  private type!: PlayerType

  /* 播放流地址 */
  @Prop()
  private url!: string

  /* 播放流地址 */
  @Prop({
    default: 'h264'
  })
  private codec: string

  /* 是否启用Debug模式 */
  @Prop({
    default: false
  })
  private isDebug: boolean

  /* 是否启用自动播放 */
  @Prop({
    default: true
  })
  private isAutoPlay: boolean

  /* 是否是实时预览视频  */
  @Prop({
    default: false
  })
  private isLive: boolean

  /* 播放速率 */
  @Prop()
  private playbackRate: number

  /* 音量 */
  @Prop()
  private volume: number

  /* 是否显示进度条 */
  @Prop({
    default: false
  })
  private hasProgress: boolean

  /* 播放器实例 */
  private player: Player = null

  /* 获取播放器实例Provide */
  @Provide('getPlayer')
  private getPlayer() {
    return this.player
  }

  /* 当URL变化后重新创建播放器 */
  @Watch('url')
  private onUrlChange() {
    this.player && this.player.disposePlayer()
    this.url && this.createPlayer()
  }

  private mounted() {
    this.createPlayer()
  }

  /**
   * 销毁播放器
   */
  private beforeDestroy() {
    this.isDebug && console.log('销毁播放器')
    this.player && this.player.disposePlayer()
  }

  /**
   * 创建播放器
   */
  private createPlayer() {
    try {
      this.player = createPlayer({
        type: this.type,
        container: this.$refs.playerContainer as HTMLDivElement,
        url: this.url,
        isDebug: this.isDebug,
        isAutoPlay: this.isAutoPlay,
        playbackRate: this.playbackRate,
        volume: this.volume
      })
      this.$nextTick(() => {
        this.$emit('onCreate', this.player)
      })
    } catch (e) {
      this.isDebug && console.log(e.message)
    }
  }
}
</script>
