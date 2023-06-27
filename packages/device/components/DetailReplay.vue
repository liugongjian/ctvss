<template>
  <ScreenBoard
    ref="screenBoard"
    :style="`height: ${height}`"
    :is-live="false"
    :in-protocol="inProtocol"
    :default-size="1"
    :is-single="true"
    :is-dialog-task="isCarTask"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import ScreenBoard from './ScreenBoard/index.vue'
import { ScreenManager } from '../services/Screen/ScreenManager'

@Component({
  name: 'DeviceReplay',
  components: {
    ScreenBoard
  }
})
export default class extends Vue {
  @Prop({ required: true }) private readonly deviceId: number
  @Prop({ required: true }) private readonly inProtocol: string
  @Prop({ required: true }) private readonly deviceName: string
  @Prop() private readonly datetimeRange?: { startTime: number; endTime: number; }
  @Prop() private readonly isCarTask?: boolean
  @Prop() private readonly lockPermission: boolean
  @Prop() private readonly info: any
  @Prop() private readonly permission: any
  @Prop() private readonly isLockTask?: boolean

  private height = 'auto'

  public screenManager: ScreenManager = null

  public mounted() {
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    // @ts-ignore
    this.screenManager = screenBoard!.screenManager
    this.screenManager.isCarTask = this.isCarTask
    // this.screenManager.isLockTask = this.isLockTask
    const screen = this.screenManager.currentScreen
    screen.deviceId = this.deviceId + ''
    screen.inProtocol = this.inProtocol
    screen.isLive = false
    screen.datetimeRange = this.datetimeRange
    screen.deviceName = this.deviceName
    screen.LockCloudRecord = this.lockPermission
    screen.detailInfo = this.info
    screen.permission = this.permission
    screen.isLockTask = this.isLockTask

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
