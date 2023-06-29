<template>
  <ScreenBoard
    ref="screenBoard"
    class="live-player"
    :style="`height: ${height}`"
    :is-live="true"
    :in-protocol="inProtocol"
    :default-size="1"
    :is-single="true"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Stream } from '@vss/vss-video-player/types/VssPlayer'
import ScreenBoard from '@vss/device/components/ScreenBoard/index.vue'
import { ScreenManager } from '@vss/device/services/Screen/ScreenManager'

@Component({
  name: 'DeviceLive',
  components: {
    ScreenBoard
  }
})
export default class extends Vue {
  @Prop() private deviceId?: number
  @Prop() private inProtocol?: string
  @Prop() private deviceName?: string
  @Prop() private streams?: any
  @Prop() private streamSize?: number
  @Prop({ default: 1 }) private streamNum?: number

  private height = 'auto'

  public screenManager: ScreenManager = null

  public mounted() {
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    // @ts-ignore
    this.screenManager = screenBoard!.screenManager
    const screen = this.screenManager.currentScreen
    screen.deviceId = this.deviceId + ''
    screen.inProtocol = this.inProtocol
    screen.streams = this.streams
    screen.streamSize = this.streamSize
    screen.streamNum = this.streamNum
    screen.isLive = true
    screen.streams = this.screenManager.fillStreams(screen)
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
    if (document.querySelector('.device-list')) {
      const deviceList: HTMLDivElement = document.querySelector('.device-list')
      this.height = `${deviceList.clientHeight - 125}px`
    } else if (document.querySelector('.dialog-player-wrapper')) {
      const deviceList: HTMLDivElement = document.querySelector('.dialog-player-wrapper')
      this.height = `${deviceList.clientHeight - 25}px`
    }
  }
}
</script>
<style lang="scss" scoped>
  .live-player {
    ::v-deep .screen-item {
      border: none;
    }
  }
</style>
