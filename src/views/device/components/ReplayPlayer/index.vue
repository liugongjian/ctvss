<template>
  <VssPlayer
    v-if="screen.currentRecord"
    ref="player"
    v-loading="screen.isLoading"
    :url="screen.currentRecord.url"
    type="hls"
    :codec="screen.codec"
    :device-info="screen.deviceInfo"
    :is-auto-play="true"
    :is-live="false"
    :has-close="hasClose"
    :has-progress="isDebug"
    :is-debug="isDebug"
    :has-live-replay-selector="hasLiveReplaySelector"
    @dispatch="onDispatch"
    @onCreate="onPlayerCreate"
  />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
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

  /**
   * 销毁播放器
   */
  private beforeDestroy() {
    this.screen.destroy()
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
        this.toggleLiveReplay(event.payload)
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
    this.screen.player.config.onEnded = this.screen.playNextRecord.bind(this.screen)
    // 跳转到offsetTime
    if (this.screen.currentRecord.offsetTime) {
      this.screen.player.seek(this.screen.currentRecord.offsetTime)
    }
  }

  /**
   * 切换录像回放/实时预览
   */
  private toggleLiveReplay(isLive: boolean) {
    this.screen.isLive = !isLive
  }

  /**
   * 关闭视频
   */
  private onClose() {
    this.$emit('close')
  }
}
</script>
