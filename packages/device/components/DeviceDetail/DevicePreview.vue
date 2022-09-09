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
import { Stream } from '@/components/VssPlayer/types/VssPlayer'
import ScreenBoard from '../ScreenBoard/index.vue'
import { ScreenManager } from '@vss/device/services/Screen/ScreenManager'
import detailMixin from '@vss/device/mixin/deviceMixin'

@Component({
  name: 'DevicePreview',
  components: {
    ScreenBoard
  }
})
export default class extends Mixins(detailMixin) {
  // @Prop() private deviceId?: number
  // @Prop() private inProtocol?: string
  private inProtocol = 'gb28181'
  @Prop() private deviceName?: string
  @Prop() private streams?: Stream[]
  @Prop() private streamSize?: number

  public screenManager: ScreenManager = null

  public async mounted() {
    await this.getDevice()
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    // @ts-ignore
    this.screenManager = screenBoard!.screenManager
    const screen = this.screenManager.currentScreen
    screen.deviceId = this.deviceId
    screen.inProtocol = this.inProtocol
    screen.streams = this.streams
    screen.streamSize = this.streamSize
    screen.streamNum = 1
    screen.isLive = true
    screen.streams = this.screenManager.fillStreams(screen)
    screen.init()
  }
}
</script>
<style lang="scss" scoped>
  .device-preview {
    height: 100%;
  }
</style>
