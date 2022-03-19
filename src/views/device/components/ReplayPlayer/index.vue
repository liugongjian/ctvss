<template>
  <VssPlayer
    ref="player"
    :url="url"
    :type="type"
    :codec="screen.codec"
    :device-info="screen.deviceInfo"
    :error-msg="screen.errorMsg"
    :is-auto-play="true"
    :is-live="false"
    :has-close="hasClose"
    :has-progress="isDebug"
    :is-loading="screen.isLoading"
    :is-debug="isDebug"
    :has-live-replay-selector="hasLiveReplaySelector"
    @dispatch="onDispatch"
    @onCreate="onPlayerCreate"
  />
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { PlayerEvent } from '@/components/VssPlayer/models/VssPlayer.d'
import { Screen } from '@/views/device/models/Screen/Screen'
import VssPlayer from '@/components/VssPlayer/index.vue'

@Component({
  name: 'ReplayPlayer',
  components: {
    VssPlayer
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

  private url: string = null
  private type: string = null
  private codec: string = null

  private get recordManager() {
    return this.screen.recordManager
  }

  @Watch('screen.recordManager.currentRecord.url')
  @Watch('screen.url')
  private onChange() {
    if (this.screen.recordType === 0) {
      this.url = this.recordManager.currentRecord && this.recordManager.currentRecord.url
      this.type = 'hls'
      this.codec = this.recordManager.currentRecord && this.recordManager.currentRecord.codec
    } else {
      this.url = this.screen.url
      this.type = 'flv'
      this.codec = this.screen.codec
    }
  }

  /**
   * 播放器事件路由
   */
  private onDispatch(event: PlayerEvent) {
    switch (event.eventType) {
      case 'close':
        this.onClose()
        break
      case 'toggleLiveReplay':
        this.toggleLiveReplay()
        break
      case 'setPlaybackRate':
        this.setPlaybackRate(event.payload)
        break
    }
  }

  /**
   * 当播放器实例创建
   * 如果设为offsetTime，则seek到此时间
   */
  private onPlayerCreate(player) {
    this.screen.player = player
    // 片段播放完后播放下一段
    this.screen.player.config.onEnded = this.recordManager.playNextRecord.bind(this.recordManager)
    // 跳转到offsetTime
    if (this.recordManager.currentRecord && this.recordManager.currentRecord.offsetTime) {
      this.screen.player.seek(this.recordManager.currentRecord.offsetTime)
    }
  }

  /**
   * 切换录像回放/实时预览
   */
  private toggleLiveReplay() {
    this.screen.isLive = true
    this.screen.init()
  }

  /**
   * 本地录像设置倍速播放
   */
  private setPlaybackRate(playbackRate: number) {
    if (this.screen.recordType === 1) {
      this.recordManager.setPlaybackRate(playbackRate)
    }
  }

  /**
   * 关闭视频
   */
  private onClose() {
    this.$emit('close')
  }
}
</script>
