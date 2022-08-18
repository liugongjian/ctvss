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
import detailMixin from '@vss/device/mixin/detailMixin'

@Component({
  name: 'DeviceReplay',
  components: {
    ScreenBoard
  }
})
export default class extends Mixins(detailMixin) {
  // @Prop({ required: true }) private readonly deviceId: number
  // @Prop({ required: true }) private readonly inProtocol: string
  private inProtocol = 'gb28181'
  @Prop() private readonly datetimeRange?: { startTime: number; endTime: number; }
  @Prop() private readonly isCarTask?: boolean

  private height = 'auto'

  public screenManager: ScreenManager = null

  public mounted() {
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    // @ts-ignore
    this.screenManager = screenBoard!.screenManager
    this.screenManager.isCarTask = this.isCarTask
    const screen = this.screenManager.currentScreen
    screen.deviceId = this.deviceId
    screen.inProtocol = this.inProtocol
    screen.isLive = false
    screen.datetimeRange = this.datetimeRange
    screen.init()
  }
}
</script>
<style lang="scss" scoped>
  .device-replay {
    height: 100%;
  }
</style>
