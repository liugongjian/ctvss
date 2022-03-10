<template>
  <div class="vss-player__wrap">
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
      <template slot="controlBody">
        <H265Icon :codec="codec" />
      </template>
      <template v-if="player" slot="controlRight">
        <StreamSelector :stream-info="streamInfo" @dispatch="dispatch" />
        <TypeSelector v-if="hasTypeSelector" :type="type" @dispatch="dispatch" />
        <Intercom />
        <DigitalZoom />
        <PtzZoom />
        <Snapshot :name="deviceInfo.deviceName" />
        <Scale />
        <Fullscreen @dispatch="dispatch" />
      </template>
    </Player>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Provide } from 'vue-property-decorator'
import { PlayerType } from '@/components/Player/models/Player.d'
import { PlayerEvent, DeviceInfo, StreamInfo } from '@/components/VssPlayer/models/VssPlayer.d'
import Player from '@/components/Player/index.vue'
import { adaptiveTools } from './directives/adaptiveTools'
/**
 * 子组件库
 */
import H265Icon from './components/H265Icon.vue'
import Snapshot from './components/Snapshot.vue'
import Scale from './components/Scale.vue'
import DigitalZoom from './components/DigitalZoom.vue'
import Close from './components/Close.vue'
import StreamSelector from './components/StreamSelector.vue'
import TypeSelector from './components/TypeSelector.vue'
import PtzZoom from './components/PtzZoom.vue'
import Intercom from './components/Intercom.vue'
import Fullscreen from './components/Fullscreen.vue'

@Component({
  name: 'VssPlayer',
  components: {
    Player,
    H265Icon,
    Scale,
    Snapshot,
    DigitalZoom,
    Close,
    StreamSelector,
    TypeSelector,
    PtzZoom,
    Intercom,
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

  /* 设备信息 */
  @Prop({
    default: {}
  })
  private deviceInfo: DeviceInfo

  /* 设备信息 */
  @Prop()
  private streamInfo: StreamInfo

  /* 播放器实例 */
  private player: Player = null

  /* 如视频编码为H265，播放器类型变为h265 */
  private get playerType() {
    return this.codec === 'h265' ? 'h265' : this.type
  }

  /* 获取转换协议后的URL */
  private get videoUrl() {
    return this.replaceProtocol(this.url, this.isWs)
  }

  /* 获取播放器实例Provide */
  @Provide('getPlayer')
  private getPlayer() {
    return this.player
  }
  /**
   * 当播放器实例创建
   */
  private onPlayerCreate(player: Player) {
    this.player = player
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
