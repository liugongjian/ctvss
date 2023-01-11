<template>
  <div
    class="player__wrap"
    :class="[{'player__wrap--live': isLive, 'player__wrap--replay': !isLive}]"
  >
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
    <div v-if="hasControl" id="control" class="control" :class="{'control--large': hasProgress}">
      <slot name="controlBody" />
      <Progress v-if="player && hasProgress" />
      <div class="control__left">
        <template v-if="!isLive">
          <PlayPause v-if="player" />
          <Timer v-if="player && hasProgress" />
        </template>
      </div>
      <div class="control__right">
        <Volume v-if="player" />
        <PlaybackRate v-if="player && !isLive && codec !== 'h265'" />
        <slot name="controlRight" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'vue-property-decorator'
import { createPlayer } from './services/PlayerFactory'
import { PlayerType } from './types/Player'
import { Player } from './services/Player'
import './styles/index.scss'
/**
 * 子组件库
 */
import PlayPause from './compontents/PlayPause.vue'
import Timer from './compontents/Timer.vue'
import Volume from './compontents/Volume.vue'
import PlaybackRate from './compontents/PlaybackRate.vue'
import Progress from './compontents/Progress.vue'

@Component({
  name: 'Player',
  components: {
    PlayPause,
    Timer,
    Volume,
    PlaybackRate,
    Progress
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
  @Prop({
    default: 1
  })
  private playbackRate: number

  /* 音量 */
  @Prop({
    default: 0.3
  })
  private volume: number

  /* 是否静音 */
  @Prop()
  private isMuted: boolean

  /* 是否显示进度条 */
  @Prop({
    default: false
  })
  private hasProgress: boolean

  /* 是否显示控制栏 */
  @Prop({
    default: true
  })
  private hasControl: boolean

  /* 播放器实例 */
  private player: Player = null

  /* 是否为直播264 */
  private get isLiveH264() {
    return this.isLive && this.type === 'flv' && this.codec === 'h264'
  }

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
    this.url && this.createPlayer()
    document.addEventListener('visibilitychange', this.onVisibilitychange)
  }

  /**
   * 销毁播放器
   */
  private beforeDestroy() {
    this.isDebug && console.log('销毁播放器')
    this.player && this.player.disposePlayer()
    document.removeEventListener('visibilitychange', this.onVisibilitychange)
  }

  /**
   * 创建播放器
   */
  private createPlayer() {
    try {
      this.player = createPlayer({
        type: this.type,
        codec: this.codec,
        container: this.$refs.playerContainer as HTMLDivElement,
        url: this.url,
        isLive: this.isLive,
        isDebug: this.isDebug,
        isAutoPlay: this.isAutoPlay,
        playbackRate: this.playbackRate,
        volume: this.volume,
        isMuted: this.isMuted,
        onRetry: this.onRetry,
        onLoadStart: this.onLoadStart,
        onCanplay: this.onCanplay
      })
      this.$nextTick(() => {
        this.$emit('onCreate', this.player)
      })
    } catch (e) {
      this.isDebug && console.log(e.message)
    }
  }

  /**
   * 切换浏览器TAB重新加载视频
   */
  private onVisibilitychange() {
    if (this.isLiveH264 && document.visibilityState === 'visible') {
      this.player && this.player.reloadPlayer()
    }
  }

  /**
   * 向上抛出重试事件
   */
  private onRetry(payload) {
    this.$emit('onRetry', payload)
  }

  /**
   * 向上抛出开始加载事件
   */
  private onLoadStart() {
    this.$emit('onLoadStart')
  }

  /**
   * 向上抛出可以播放事件
   */
  private onCanplay() {
    this.$emit('onCanplay')
  }
}
</script>
