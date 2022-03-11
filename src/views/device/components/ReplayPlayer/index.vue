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
    :is-debug="true"
    @dispatch="onDispatch"
  />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { PlayerEvent } from '@/components/VssPlayer/models/VssPlayer.d'
import { ReplayScreen as Screen } from '@/views/device/models/Screen/ReplayScreen'
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

  /**
   * 播放器事件路由
   */
  private onDispatch(event: PlayerEvent) {
    switch (event.eventType) {
      case 'close':
        this.onClose()
        break
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
