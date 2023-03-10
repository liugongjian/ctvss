<template>
  <div ref="vssPlayerWrap" v-loading="loading" class="vss-player__wrap vss-player__wrap--medium">
    <Player
      ref="player"
      v-adaptive-tools
      :type="type"
      :url="videoUrl"
      :codec="codec"
      :volume="volume"
      :is-muted="isMuted"
      :has-audio="hasAudio"
      :playback-rate="playbackRate"
      :has-progress="hasProgress"
      :is-live="isLive"
      :is-debug="true"
      @onCreate="onPlayerCreate"
      @onRetry="onRetry"
      @onLoadStart="onLoadStart"
      @onCanplay="onCanplay"
    >
      <template slot="headerLeft" />
      <template slot="headerRight">
        <Close v-if="hasClose" @dispatch="dispatch" />
      </template>
      <template slot="container">
        <ErrorMsg v-if="errorMsg" :error-msg="errorMsg">
          <!--用于无录像返回实时预览-->
          <LiveReplaySelector
            v-if="hasLiveReplaySelector && !isLive"
            :is-live="isLive"
            :is-button="false"
            @dispatch="dispatch"
          />
        </ErrorMsg>
        <slot name="container" />
      </template>
      <template slot="controlBody">
        <H265Icon :codec="codec" />
        <More :has-axis="hasAxis" :player-wrap="$refs.vssPlayerWrap" />
        <slot name="controlBody" />
      </template>
      <template slot="controlRight">
        <StreamSelector :stream-info="player && streamInfo" @dispatch="dispatch" />
        <TypeSelector v-if="hasTypeSelector && codec !== 'h265' " :type="type" @dispatch="dispatch" />
        <Intercom v-if="player && isLive && deviceInfo.inProtocol === 'gb28181'" :stream-info="streamInfo" :device-info="deviceInfo" :url="videoUrl" :type="type" :codec="codec" />
        <DigitalZoom v-if="player" ref="digitalZoom" @dispatch="dispatch" />
        <PtzZoom v-if="player && isLive" ref="ptzZoom" :stream-info="streamInfo" :device-info="deviceInfo" @dispatch="dispatch" />
        <Snapshot v-if="player" :name="deviceInfo.deviceName" />
        <Scale v-if="player" :url="videoUrl" :default-scale="scale" />
        <LiveReplaySelector v-if="hasLiveReplaySelector" :is-live="isLive" @dispatch="dispatch" />
        <slot name="controlRight" />
      </template>
    </Player>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Provide, Watch } from 'vue-property-decorator'
import './styles/index.scss'
import { PlayerType } from '@/components/Player/types/Player.d'
import { PlayerEvent, DeviceInfo, StreamInfo } from '@/components/VssPlayer/types/VssPlayer'
import Player from '@/components/Player/index.vue'
import { Player as PlayerModel } from '@/components/Player/services/Player'
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
import More from './components/More.vue'

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
    More
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
    default: () => {
      return {
        deviceId: null,
        deviceName: ''
      }
    }
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

  /* 默认音量 */
  @Prop({
    default: false
  })
  private isMuted: boolean

  /* 是否含音轨 */
  @Prop({
    default: true
  })
  private hasAudio: boolean

  /* 默认缩放比例 */
  @Prop()
  private scale: string

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

  /* 是否加载中 */
  @Prop({
    default: false
  })
  private isLoading: boolean

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

  /* 是否含有录像时间轴 */
  @Prop({
    default: false
  })
  private hasAxis: boolean

  /* 播放器实例 */
  private player: PlayerModel = null

  /* 如视频编码为H265，播放器类型变为h265 */
  // private get playerType() {
  //   return this.codec === 'h265' ? 'h265' : this.type
  // }

  /* 获取转换协议后的URL */
  private get videoUrl() {
    return this.replaceProtocol(this.url, this.isWs)
  }

  /* 视频是否加载中 */
  private get loading() {
    return (this.player && this.player.isLoading) || this.isLoading
  }

  /* 播放器容器 */
  private get vssPlayerWrap() {
    return this.$refs.vssPlayerWrap
  }

  /* 获取播放器实例Provide */
  @Provide('getPlayer')
  private getPlayer() {
    return this.player
  }

  /**
   * 监听录像倍速播放变化
   * 用于触发设备录像的倍速播放
   */
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
   * 向上抛出重试事件
   */
  private onRetry(payload) {
    this.$emit('dispatch', {
      eventType: 'retry',
      payload
    })
  }

  /**
   * 向上抛出开始加载事件
   */
  private onLoadStart() {
    this.$emit('dispatch', {
      eventType: 'loadStart'
    })
  }

  /**
   * 向上抛出可以播放事件
   */
  private onCanplay() {
    this.$emit('dispatch', {
      eventType: 'canplay'
    })
  }

  /**
   * 当切换视频格式
   */
  private dispatch(event: PlayerEvent) {
    switch (event.eventType) {
      case 'enableZoom':
        this.enableZoom(event.payload)
        break
    }
    this.$emit('dispatch', event)
  }

  /**
   * 切换Zoom类型
   */
  private enableZoom(payload) {
    let zoomRef
    if (payload === 'ptz') {
      zoomRef = this.$refs.digitalZoom
    } else {
      zoomRef = this.$refs.ptzZoom
    }
    zoomRef && zoomRef.close()
  }

  /* 替换播放地址协议 */
  private replaceProtocol(url: string, isWs: boolean): string {
    if (!url) return ''
    let _url = url
    const isHttps = window.location.protocol === 'https:'
    if (isHttps) {
      _url = _url.replace('http://', 'https://')
    }
    if (isWs) {
      if (_url.startsWith('https://')) {
        _url = _url.replace('https://', 'wss://')
      } else {
        _url = _url.replace('http://', 'ws://')
      }
    }
    return _url
  }
}
</script>
