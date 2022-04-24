<template>
  <ScreenBoard
    ref="screenBoard"
    :style="`height: ${height}`"
    :is-live="false"
    :in-protocol="inProtocol"
    :default-size="1"
    :is-single="true"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import ScreenBoard from './ScreenBoard/index.vue'
import { ScreenManager } from '../models/Screen/ScreenManager'

@Component({
  name: 'DeviceReplay',
  components: {
    ScreenBoard
  }
})
export default class extends Vue {
  @Prop() private deviceId?: number
  @Prop() private inProtocol?: string

  private height = 'auto'

  public screenManager: ScreenManager = null

  public mounted() {
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    // @ts-ignore
    this.screenManager = screenBoard!.screenManager
    const screen = this.screenManager.currentScreen
    screen.deviceId = this.deviceId
    screen.inProtocol = this.inProtocol
    screen.isLive = false
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
    const deviceList: HTMLDivElement = document.querySelector('.device-list')
    this.height = `${deviceList.clientHeight - 125}px`
  }
}
</script>
<style lang="scss" scoped>
  .replay-view {
    width: 100%;
    display: flex;
    flex-direction: column;

    ::v-deep .replay-player {
      flex: 1;
    }
  }

  .fullscreen ::v-deep .preview-player .video-wrap,
  .fullscreen.replay-view {
    position: fixed;
    z-index: 1001;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100% !important;
    background: #333;
  }

  .fullscreen.replay-view {
    ::v-deep .filter-container {
      display: none;
    }
  }
</style>
