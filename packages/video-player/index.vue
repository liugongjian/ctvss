<template>
  <div
    class="player__wrap"
    :class="[{ 'player__wrap--live': isLive, 'player__wrap--replay': !isLive }]"
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
    <div v-if="hasControl" id="control" class="control" :class="{ 'control--large': hasProgress }">
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
        <PlaybackRate v-if="player && !isLive && codec !== CodecEnum.H265" />
        <Fullscreen v-if="hasFullscreen" />
        <slot name="controlRight" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'vue-property-decorator'
import { createPlayer } from './services/PlayerFactory'
import { Player } from './services/Player'
import { TypeEnum, CodecEnum } from './enums'
import './styles/index.scss'
/**
 * 子组件库
 */
import PlayPause from './compontents/PlayPause.vue'
import Timer from './compontents/Timer.vue'
import Volume from './compontents/Volume.vue'
import PlaybackRate from './compontents/PlaybackRate.vue'
import Fullscreen from './compontents/Fullscreen.vue'
import Progress from './compontents/Progress.vue'

@Component({
  name: 'Player',
  components: {
    PlayPause,
    Timer,
    Volume,
    PlaybackRate,
    Fullscreen,
    Progress
  }
})
export default class extends Vue {
  /* 播放器类型 */
  @Prop()
  private type!: TypeEnum

  /* 播放流地址 */
  @Prop({
    default: CodecEnum.H264
  })
  private codec: CodecEnum

  /* 播放流地址 */
  @Prop()
  private url!: string

  /* 音量 */
  @Prop({
    default: 0.3
  })
  private volume: number

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

  /* 是否显示全屏按钮 */
  @Prop({
    default: true
  })
  private hasFullscreen: boolean

  /* 视频封面 */
  @Prop()
  private poster: string

  /* 播放器实例 */
  public player: Player = null
  private CodecEnum = CodecEnum

  /* 如果未传type，则根据url后缀自动识别 */
  private get videoType(): TypeEnum {
    if (this.type) {
      return this.type
    } else {
      const ext = this.url.substring(this.url.lastIndexOf('.') + 1)
      switch (ext) {
        case 'flv':
          return TypeEnum.FLV
        case 'm3u8':
          return TypeEnum.HLS
        default:
          return TypeEnum.FLV
      }
    }
  }

  /* 是否为直播264 */
  private get isLiveH264() {
    return this.isLive && this.videoType === TypeEnum.FLV && this.codec === CodecEnum.H264
  }

  /* 是否加载中 */
  private get isLoading() {
    return this.player && this.player.isLoading
  }

  /* 获取播放器实例Provide */
  @Provide('getPlayer')
  private getPlayer() {
    return this.player
  }

  private mounted() {
    this.url && this.createPlayer()
    if (this.isLive) document.addEventListener('visibilitychange', this.onVisibilitychange)
  }

  /**
   * 销毁播放器
   */
  private beforeDestroy() {
    this.isDebug && console.log('销毁播放器')
    this.player && this.player.disposePlayer()
    if (this.isLive) document.removeEventListener('visibilitychange', this.onVisibilitychange)
  }

  /**
   * 创建播放器
   */
  private createPlayer() {
    try {
      this.player = createPlayer({
        type: this.videoType,
        codec: this.codec,
        container: this.$refs.playerContainer as HTMLDivElement,
        url: this.url,
        isLive: this.isLive,
        isDebug: this.isDebug,
        isAutoPlay: this.isAutoPlay,
        playbackRate: this.playbackRate,
        volume: this.volume,
        isMuted: this.isMuted,
        poster: this.poster,
        onPlay: this.onPlay,
        onPause: this.onPause,
        onEnded: this.onEnded,
        onRetry: this.onRetry,
        onTimeUpdate: this.onTimeUpdate,
        onDurationChange: this.onDurationChange,
        onVolumeChange: this.onVolumeChange,
        onRateChange: this.onRateChange,
        onSeeked: this.onSeeked,
        onBuffered: this.onBuffered,
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
   * =======================================================
   * 属性监听
   * =======================================================
   */
  /* 当URL变化后重新创建播放器 */
  @Watch('url')
  private watchUrlChange() {
    this.player && this.player.disposePlayer()
    this.url && this.createPlayer()
  }

  /* 监听音量变化 */
  @Watch('volume')
  private watchVolumeChange(volume) {
    this.player && this.player.setVolume(volume)
  }

  /* 监听倍速变化 */
  @Watch('playbackRate')
  private watchPlaybackRateChange(playbackRate) {
    this.player && this.player.setPlaybackRate(playbackRate)
  }

  /**
   * =======================================================
   * 方法
   * =======================================================
   */
  /**
   * 播放
   */
  public play() {
    this.player.play()
  }

  /**
   * 暂停
   */
  public pause() {
    this.player.pause()
  }

  /**
   * 跳进(Seek)
   * @param time 秒
   */
  public seek(time: number) {
    this.player.seek(time)
  }

  /**
   * 开关静音
   * @param isMuted 是否静音
   */
  public toggleMuteStatus(isMuted: boolean) {
    this.player.toggleMuteStatus(isMuted)
  }

  /**
   * 调整音量
   * @param volume 音量大小，取值0-1
   */
  public setVolume(volume: number) {
    this.player.setVolume(volume)
  }

  /**
   * 设置播放速率
   * @param playbackRate 播放速率
   */
  public setPlaybackRate(playbackRate: number) {
    this.player.setPlaybackRate(playbackRate)
  }

  /**
   * 重新加载播放器
   */
  public reloadPlayer() {
    this.player.reloadPlayer()
  }

  /**
   * 销毁播放器
   */
  public disposePlayer() {
    this.player.disposePlayer()
  }

  /**
   * =======================================================
   * 回调事件
   * =======================================================
   */

  /**
   * 向上抛出重试事件开始播放事件
   */
  private onPlay() {
    this.$emit('onPlay')
  }

  /**
   * 向上抛出重试事件开始暂停事件
   */
  private onPause() {
    this.$emit('onPause')
  }

  /**
   * 向上抛出播放完成事件
   */
  private onEnded() {
    this.$emit('onEnded')
  }

  /**
   * 向上抛出重试事件
   */
  private onRetry(payload) {
    this.$emit('onRetry', payload)
  }

  /**
   * 向上抛出时间变化事件
   */
  private onTimeUpdate(currentTime) {
    this.$emit('onTimeUpdate', currentTime)
  }

  /**
   * 向上抛出视频时长变化事件
   */
  private onDurationChange(duration) {
    this.$emit('onDurationChange', duration)
  }

  /**
   * 向上抛出音量变化事件
   */
  private onVolumeChange(volume) {
    this.$emit('onVolumeChange', volume)
  }

  /**
   * 向上抛出播放倍速变化事件
   */
  private onRateChange(playbackRate) {
    this.$emit('onRateChange', playbackRate)
  }

  /**
   * 向上抛出跳跃事件
   */
  private onSeeked(currentTime) {
    this.$emit('onSeeked', currentTime)
  }

  /**
   * 向上抛出预加载完成事件
   */
  private onBuffered(bufferedTime) {
    this.$emit('onBuffered', bufferedTime)
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
