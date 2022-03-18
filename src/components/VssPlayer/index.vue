<template>
  <div v-loading="isLoading" class="vss-player__wrap">
    <Player
      ref="player"
      v-adaptive-tools
      :type="playerType"
      :url="videoUrl"
      :codec="codec"
      :volume="volume"
      :playback-rate="playbackRate"
      :has-progress="hasProgress"
      :is-live="isLive"
      :is-debug="true"
      @onCreate="onPlayerCreate"
    >
      <template slot="headerLeft" />
      <template slot="headerRight">
        <Close v-if="hasClose" @dispatch="dispatch" />
      </template>
      <template slot="container">
        <ErrorMsg v-if="errorMsg" :error-msg="errorMsg" />
      </template>
      <template slot="controlBody">
        <H265Icon :codec="codec" />
      </template>
      <template v-if="player" slot="controlRight">
        <StreamSelector :stream-info="streamInfo" @dispatch="dispatch" />
        <TypeSelector v-if="hasTypeSelector" :type="type" @dispatch="dispatch" />
        <Intercom v-if="isLive" :stream-info="streamInfo" :device-info="deviceInfo" :url="videoUrl" :type="playerType" :codec="codec" />
        <DigitalZoom />
        <PtzZoom v-if="isLive" :stream-info="streamInfo" :device-info="deviceInfo" />
        <Snapshot :name="deviceInfo.deviceName" />
        <Scale />
        <LiveReplaySelector v-if="hasLiveReplaySelector" :is-live="isLive" @dispatch="dispatch" />
        <Fullscreen @dispatch="dispatch" />
      </template>
    </Player>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'vue-property-decorator'
import './styles/index.scss'
import { PlayerType } from '@/components/Player/models/Player.d'
import { PlayerEvent, DeviceInfo, StreamInfo } from '@/components/VssPlayer/models/VssPlayer.d'
import Player from '@/components/Player/index.vue'
import { Player as PlayerModel } from '@/components/Player/models/Player'
import { adaptiveTools } from './directives/adaptiveTools'
/**
 * 子组件库
 */
import H265Icon from './components/H265Icon.vue'
import ErrorMsg from './components/ErrorMsg.vue'
import Snapshot from './components/Snapshot.vue'
import Scale from './components/Scale.vue'
import DigitalZoom from './components/DigitalZoom.vue'
import Close from './components/Close.vue'
import StreamSelector from './components/StreamSelector.vue'
import TypeSelector from './components/TypeSelector.vue'
import PtzZoom from './components/PtzZoom.vue'
import Intercom from './components/Intercom.vue'
import LiveReplaySelector from './components/LiveReplaySelector.vue'
import Fullscreen from './components/Fullscreen.vue'

@Component({
  name: 'VssPlayer',
  components: {
    Player,
    H265Icon,
    ErrorMsg,
    Scale,
    Snapshot,
    DigitalZoom,
    Close,
    StreamSelector,
    TypeSelector,
    PtzZoom,
    Intercom,
    LiveReplaySelector,
    Fullscreen
  },
  directives: {
    // 动态隐藏播放器工具栏与头部
    'adaptive-tools': adaptiveTools
  }
})
export default class extends Vue {
  /* 播放器类型 */
  @Prop()
  private type!: PlayerType

  /* 播放流地址 */
  @Prop()
  private url!: string

  /* 设备信息 */
  @Prop({
    default: {}
  })
  private deviceInfo: DeviceInfo

  /* 设备信息 */
  @Prop()
  private streamInfo: StreamInfo

  /* 错误信息 */
  @Prop()
  private errorMsg: string

  /* 播放流地址 */
  @Prop({
    default: 'h264'
  })
  private codec: string

  /* 默认音量 */
  @Prop({
    default: 0.3
  })
  private volume: number

  /* 是否为直播 */
  @Prop({
    default: false
  })
  private isLive: boolean

  /* 是否启用websocket */
  @Prop({
    default: false
  })
  private isWs: boolean

  /* 默认倍速 */
  @Prop({
    default: 1
  })
  private playbackRate: number

  /* 是否显示进度条 */
  @Prop()
  private hasProgress: boolean

  /* 是否显示关闭按钮 */
  @Prop({
    default: false
  })
  private hasClose: boolean

  /* 是否显示类型切换按钮 */
  @Prop({
    default: false
  })
  private hasTypeSelector: boolean

  /* 是否显示录像回放/直播切换按钮 */
  @Prop({
    default: false
  })
  private hasLiveReplaySelector: boolean

  /* 播放器实例 */
  private player: PlayerModel = null

  /* 如视频编码为H265，播放器类型变为h265 */
  private get playerType() {
    return this.codec === 'h265' ? 'h265' : this.type
  }

  /* 获取转换协议后的URL */
  private get videoUrl() {
    return this.replaceProtocol(this.url, this.isWs)
  }

  /* 视频是否加载中 */
  private get isLoading() {
    return this.player && this.player.isLoading
  }

  /* 获取播放器实例Provide */
  @Provide('getPlayer')
  private getPlayer() {
    return this.player
  }

  @Watch('player.playbackRate')
  private onPlaybackRateChange() {
    this.$emit('dispatch', {
      eventType: 'setPlaybackRate',
      payload: this.player.playbackRate
    })
  }

  /**
   * 当播放器实例创建
   */
  private onPlayerCreate(player) {
    this.player = player
    this.$emit('onCreate', player)
  }

  /**
   * 当切换视频格式
   */
  private dispatch(event: PlayerEvent) {
    this.$emit('dispatch', event)
  }

  /* 替换播放地址协议 */
  private replaceProtocol(url: string, isWs: boolean) {
    let _url = url
    const isHttps = window.location.protocol === 'https:'
    if (isHttps) {
      _url = _url.replace('http://', 'https://')
    }
    if (isWs) {
      if (isHttps) {
        _url = _url.replace('https://', 'wss://')
      } else {
        _url = _url.replace('http://', 'ws://')
      }
    }
    return _url
  }
}
</script>
