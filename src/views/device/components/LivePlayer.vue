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
    :has-close="hasClose"
    :has-live-replay-selector="hasLiveReplaySelector"
    :is-debug="isDebug"
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
  name: 'LivePlayer',
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
   * 当播放器实例创建
   */
  private onPlayerCreate(player) {
    this.screen.player = player
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
    }
  }

  /**
   * 切换主子码流
   */
  private onStreamNumChange(streamNum: number) {
    this.screen.streamInfo.streamNum = streamNum
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
  }

  /**
   * 关闭视频
   */
  private onClose() {
    this.$emit('close')
  }
}
</script>
