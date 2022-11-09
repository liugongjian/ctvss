<template>
  <ScreenBoard
    ref="screenBoard"
    class="device-preview"
    :is-live="true"
    :in-protocol="inProtocol"
    :default-size="1"
    :is-single="true"
  />
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import ScreenBoard from '../ScreenBoard/index.vue'
import { ScreenManager } from '@vss/device/services/Screen/ScreenManager'
import detailMixin from '@vss/device/mixin/deviceMixin'
import { VideoDevice } from '@vss/device/type/Device'
import * as dicts from '@vss/device/dicts'

@Component({
  name: 'DevicePreview',
  components: {
    ScreenBoard
  }
})
export default class extends Mixins(detailMixin) {
  // @Prop() private deviceName?: string
  // @Prop() private streams?: Stream[]
  // @Prop() private streamSize?: number
  @Prop() private getDevicePreviewApi: Function
  @Prop() private readonly deviceIdCar?: any

  public screenManager: ScreenManager = null

  // 视频接入协议
  private get inVideoProtocol() {
    return this.device.videos && this.device.videos.length && this.device.videos[0]?.inVideoProtocol
  }

  // 视频接入信息
  private get videoInfo(): VideoDevice {
    return this.inVideoProtocol && this.device.videos[0][dicts.InVideoProtocolModelMapping[this.inVideoProtocol]]
  }

  public async mounted() {
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    this.screenManager = screenBoard?.screenManager
    const screen = this.screenManager.currentScreen
    screen.deviceId = this.deviceId || this.deviceIdCar
    screen.isLive = true
    await this.getDevice()
    if (this.videoInfo) {
      screen.inProtocol = this.inVideoProtocol
      screen.streams = this.videoInfo.streams
      screen.streamSize = this.videoInfo.deviceStreamSize
      screen.streamNum = this.videoInfo.deviceStreamPullIndex
      screen.streams = this.screenManager.fillStreams(screen)
      // IBox替换默认获取流地址接口
      if (this.getDevicePreviewApi) {
        screen.getDevicePreviewApi = this.getDevicePreviewApi
      }
      screen.init()
    } else {
      screen.errorMsg = '未接入视频协议'
    }
  }
}
</script>
<style lang="scss" scoped>
  .device-preview {
    height: 100%;
  }
</style>
