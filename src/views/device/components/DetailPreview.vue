<template>
  <player-container :on-can-play="onCanPlay">
    <live-view
      :class="{'fullscreen': isFullscreen}"
      :device-id="deviceId"
      :in-protocol="inProtocol"
      :is-fullscreen="isFullscreen"
      @onCanPlay="playEvent"
      @onFullscreen="isFullscreen = true; fullscreen()"
      @onExitFullscreen="exitFullscreen()"
    />
  </player-container>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Inject } from 'vue-property-decorator'
import FullscreenMixin from '../mixin/fullscreenMixin'
import LiveView from './LiveView.vue'
import PlayerContainer from './PlayerContainer.vue'

@Component({
  name: 'DevicePreview',
  components: {
    LiveView,
    PlayerContainer
  }
})
export default class extends Mixins(FullscreenMixin) {
  @Inject('deviceRouter') private deviceRouter!: Function

  @Prop() private deviceId: string
  @Prop() private inProtocol: string

  private onCanPlay = false

  private mounted() {
    window.addEventListener('resize', this.checkFullscreen)
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.checkFullscreen)
  }

  /**
   * 鼠标移入移出视频触发事件
   */
  private playEvent(val: boolean) {
    this.onCanPlay = val
  }
}
</script>
<style lang="scss" scoped>
  .fullscreen ::v-deep .preview-player .video-wrap {
    position: fixed;
    z-index: 1001;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100% !important;
    background: #333;
  }

  .fullscreen ::v-deep .preview-player video {
    position: absolute;
    height: 100%;
  }

  .fullscreen ::v-deep .preview-player canvas {
    position: absolute;
    width: 100%;
  }

  .fullscreen ::v-deep .preview-player .video-wrap {
    max-height: 100%;
  }
</style>
