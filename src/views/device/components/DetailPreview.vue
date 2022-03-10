<template>
  <LivePlayer
    v-if="screen"
    :style="`height: ${height}`"
    :screen="screen"
  />
</template>

<script lang="ts">
import { Component, Prop, Mixins, Inject } from 'vue-property-decorator'
import { Stream } from '@/components/VssPlayer/models/VssPlayer'
import FullscreenMixin from '../mixin/fullscreenMixin'
import LiveView from './LiveView.vue'
import LivePlayer from './LivePlayer.vue'
import PlayerContainer from './PlayerContainer.vue'
import Screen from '../models/Screen'

@Component({
  name: 'DevicePreview',
  components: {
    LiveView,
    LivePlayer,
    PlayerContainer
  }
})
export default class extends Mixins(FullscreenMixin) {
  @Inject('deviceRouter') private deviceRouter!: Function

  @Prop()
  private deviceId?: string

  @Prop()
  private inProtocol?: string

  @Prop()
  private deviceName?: string

  @Prop()
  private streams?: Stream[]

  @Prop()
  private streamSize?: number

  private screen = {}

  private height = 'auto'

  private mounted() {
    const screen = new Screen()
    screen.deviceInfo = {
      deviceId: this.deviceId,
      inProtocol: this.inProtocol,
      deviceName: this.deviceName
    }
    screen.streamInfo = {
      streams: this.streams,
      streamSize: this.streamSize,
      streamNum: 1
    }
    screen.type = 'flv'
    this.screen = screen
    screen.getUrl()
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.calMaxHeight)
  }

  /**
   * 计算最大高度
   */
  public calMaxHeight() {
    const deviceList: any = document.querySelector('.device-list__max-height')
    this.height = `${deviceList.clientHeight - 84}px`
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
