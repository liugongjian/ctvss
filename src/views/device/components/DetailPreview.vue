<template>
  <LivePlayer
    v-if="screen"
    class="live-player"
    :class="{'fullscreen': screen.isFullscreen}"
    :style="`height: ${height}`"
    :screen="screen"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Stream } from '@/components/VssPlayer/models/VssPlayer'
import LivePlayer from './LivePlayer.vue'
import { Screen } from '../models/Screen/Screen'

@Component({
  name: 'DevicePreview',
  components: {
    LivePlayer
  }
})
export default class extends Vue {
  @Prop()
  private deviceId?: number

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
    screen.deviceId = this.deviceId
    screen.inProtocol = this.inProtocol
    screen.deviceName = this.deviceName
    screen.streams = this.streams
    screen.streamSize = this.streamSize
    screen.streamNum = 1
    screen.type = 'flv'
    screen.isLive = true
    this.screen = screen
    screen.init()
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
    this.height = `${deviceList.clientHeight}px`
  }
}
</script>
<style lang="scss" scoped>
  .live-player {
    background: #333;
    &.fullscreen {
      position: fixed;
      z-index: 1001;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: 100% !important;
      background: #333;
    }
  }
</style>
