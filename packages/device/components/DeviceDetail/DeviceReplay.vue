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
import { Component, Prop, Mixins } from 'vue-property-decorator'
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
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    // @ts-ignore
    this.screenManager = screenBoard?.screenManager
    this.screenManager.isCarTask = this.isCarTask
    const screen = this.screenManager.currentScreen
    screen.deviceId = this.deviceId || this.deviceIdCar
    screen.isLive = false
    screen.datetimeRange = this.datetimeRange
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
