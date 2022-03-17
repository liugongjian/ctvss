<template>
  <VssPlayer
    ref="player"
    v-loading="screen.isLoading"
    :url="url"
    type="hls"
    :codec="screen.codec"
    :device-info="screen.deviceInfo"
    :error-msg="screen.errorMsg"
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

  private get url() {
    return this.screen.currentRecord && this.screen.currentRecord.url
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
  private toggleLiveReplay() {
    console.log('toggleLiveReplay')
    this.screen.isLive = true
    this.screen.init()
  }

  /**
   * 关闭视频
   */
  private onClose() {
    this.$emit('close')
  }
}
</script>
