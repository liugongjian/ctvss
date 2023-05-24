<template>
  <ScreenBoard
    ref="screenBoard"
    class="device-replay"
    :is-live="false"
    :in-protocol="inProtocol"
    :default-size="1"
    :is-single="true"
  />
</template>

<script lang="ts">
import { Component, Prop, Mixins, Inject } from 'vue-property-decorator'
import ScreenBoard from '../ScreenBoard/index.vue'
import { ScreenManager } from '../../services/Screen/ScreenManager'
import detailMixin from '@vss/device/mixin/deviceMixin'

@Component({
  name: 'DeviceReplay',
  components: {
    ScreenBoard
  }
})
export default class extends Mixins(detailMixin) {
  @Inject({ default: () => ({}) })
  public getActions!: Function
  private get deviceActions() {
    return this.getActions && this.getActions()
  }
  @Prop() private readonly datetimeRange?: { startTime: number; endTime: number; }
  @Prop() private readonly isCarTask?: boolean
  @Prop() private readonly deviceIdCar?: any

  private height = 'auto'

  public screenManager: ScreenManager = null

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.videos && this.device.videos.length && this.device.videos[0]?.inVideoProtocol
  }

  public async mounted() {
    this.deviceIdSecondary = this.deviceIdCar
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    // @ts-ignore
    this.screenManager = screenBoard?.screenManager
    this.screenManager.isCarTask = this.isCarTask
    const screen = this.screenManager.currentScreen
    screen.deviceId = this.deviceId || this.deviceIdSecondary
    screen.isLive = false
    screen.datetimeRange = this.datetimeRange
    // 设备管理入口的录像回放Tab，未通过左侧树的点击绑定IAM权限，此处进行补充
    if (!screen.permission) {
      screen.permission = this.deviceActions
    }
    await this.getDevice()
    screen.inProtocol = this.inVideoProtocol
    screen.init()
  }
}
</script>
<style lang="scss" scoped>
  .device-replay {
    height: 100%;
  }
</style>
