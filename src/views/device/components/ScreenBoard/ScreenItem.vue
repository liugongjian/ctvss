<template>
  <div
    class="screen-item"
    @click="click"
  >
    <div v-if="videoTypeLabel && !screen.isLoading" class="video-type-label">{{ videoTypeLabel }}</div>
    <template v-if="screen.deviceId">
      <LivePlayer
        v-if="screen.isLive"
        :screen="screen"
        :has-close="true"
        :is-debug="true"
        :has-live-replay-selector="true"
        @close="close"
      />
      <ReplayPlayer
        v-else
        :screen="screen"
        :has-axis="hasAxis"
        :has-close="true"
        :is-debug="true"
        :has-live-replay-selector="true"
        @close="close"
      />
    </template>
    <div v-else class="tip-text tip-select-device">
      <el-button type="text" @click="selectDevice">请选择设备</el-button>
    </div>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Inject } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
import LivePlayer from '../LivePlayer.vue'
import ReplayPlayer from '../ReplayPlayer/index.vue'
import DeviceDir from '../dialogs/DeviceDir.vue'

@Component({
  name: 'ScreenItem',
  components: {
    LivePlayer,
    ReplayPlayer,
    DeviceDir
  }
})
export default class extends Vue {
  @Prop()
  private screen

  @Inject('getScreenManager')
  private getScreenManager: Function

  private get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  private get videoTypeLabel() {
    let label = ''
    if (this.screen.isLive !== null && this.screenManager.isLive !== this.screen.isLive) {
      label = this.screen.isLive ? '实时画面' : '回放画面'
    }
    return label
  }

  /**
   * 在实时预览页面中显示录像回放时间轴
   */
  private get hasAxis() {
    return this.screenManager.isLive && !this.screen.isLive
  }

  private dialogs = {
    deviceDir: false
  }

  /**
   * 关闭视频
   */
  private close() {
    this.screen.destroy()
  }

  /**
   * 单击视频
   */
  private click() {
    this.$emit('click')
  }

  /**
   * 选择视频
   * @param screen 视频
   */
  private selectDevice() {
    this.dialogs.deviceDir = true
  }

  /**
   * 关闭视频选择对话框
   * @param device 设备
   */
  private onDeviceDirClose(device) {
    this.dialogs.deviceDir = false
    if (device) {
      this.$emit('openScreen', device)
    }
  }
}
</script>
