<template>
  <VssPlayer
    ref="player"
    :url="screen.url"
    :type="screen.type"
    :codec="screen.codec"
    :device-info="screen.deviceInfo"
    :stream-info="screen.streamInfo"
    :has-type-selector="screen.hasRtc"
    :error-msg="screen.errorMsg"
    :is-auto-play="true"
    :is-live="true"
    :is-ws="true"
    :is-loading="screen.isLoading"
    :volume="screen.volume"
    :is-muted="screen.isMuted"
    :has-close="hasClose"
    :has-live-replay-selector="hasLiveReplaySelector"
    :scale="screen.scale"
    :poster="screen.poster"
    :is-debug="isDebug"
    @dispatch="onDispatch"
    @onCreate="onPlayerCreate"
  >
    <template slot="container">
      <slot name="default" />
    </template>
    <template slot="controlRight">
      <Fullscreen :is-fullscreen="isFullscreen" :type="FullscreenTypeEnum.Screen" @change="onFullscreenChange" />
    </template>
  </VssPlayer>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { PlayerEvent } from '@vss/vss-video-player/types/VssPlayer'
import { ScreenModule } from '@vss/device/store/modules/screen'
import { Screen } from '@vss/device/services/Screen/Screen'
import { FullscreenTypeEnum } from '@vss/device/enums/screen'
import VssPlayer from '@vss/vss-video-player/index.vue'
import Fullscreen from './ScreenBoard/components/Fullscreen.vue'

@Component({
  name: 'LivePlayer',
  components: {
    VssPlayer,
    Fullscreen
  }
})
export default class extends Vue {
  @Prop()
  private screen: Screen

  @Prop()
  private hasClose: Boolean

  @Prop()
  private hasLiveReplaySelector: Boolean

  @Prop()
  private isDebug: Boolean

  private FullscreenTypeEnum = FullscreenTypeEnum

  /* 当前全屏状态 */
  private get isFullscreen() {
    return this.screen && this.screen.isFullscreen
  }

  /**
   * 当播放器实例创建
   */
  private onPlayerCreate(player) {
    this.screen.player = player
    this.screen.errorMsg = null
    this.screen.log.playerInitTimestamp = new Date().getTime()
  }

  /**
   * 播放器事件路由
   */
  private onDispatch(event: PlayerEvent) {
    switch (event.eventType) {
      case 'streamNumChange':
        this.onStreamNumChange(event.payload)
        break
      case 'typeChange':
        this.onTypeChange(event.payload)
        break
      case 'close':
        this.onClose()
        break
      case 'toggleLiveReplay':
        this.toggleLiveReplay()
        break
      case 'retry':
        this.onRetry(event.payload)
        break
      case 'loadStart':
        this.onLoadStart()
        break
      case 'canplay':
        this.onCanplay()
        break
    }
  }

  /**
   * 切换主子码流
   */
  private onStreamNumChange(streamNum: number) {
    this.screen.streamNum = streamNum
    this.screen.init()
  }

  /**
   * 切换播放格式
   */
  private onTypeChange(type: string) {
    this.screen.type = type
    this.screen.init()
  }

  /**
   * 切换录像回放/实时预览
   */
  private toggleLiveReplay() {
    this.screen.isLive = false
    this.screen.init()
    if (this.screen.isFullscreen) {
      ScreenModule.setIsFullscreen(this.screen.isFullscreen)
    }
  }

  /**
   * 视频断流30秒后重试
   */
  private onRetry(payload?) {
    let timeout = 30 * 1000
    if (payload && payload.immediate) {
      timeout = 100
    }
    setTimeout(() => {
      try {
        this.screen.init()
      } catch {
        this.onRetry()
      }
    }, timeout)
  }

  /**
   * 关闭视频
   */
  private onClose() {
    this.$emit('close')
  }

  /**
   * 全屏操作
   */
  private onFullscreenChange(isFullscreen) {
    this.screen.isFullscreen = isFullscreen
  }

  /**
   * 开始加载
   */
  private onLoadStart() {
    this.screen.log.playerLoadstartTimestamp = new Date().getTime()
  }

  /**
   * 加载完成可以开始播放
   */
  private onCanplay() {
    if (!this.screen.log.playerCanplayTimstamp) {
      this.screen.log.playerCanplayTimstamp = new Date().getTime()
      this.$emit('canplay')
    }
  }
}
</script>
