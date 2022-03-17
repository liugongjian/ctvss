<template>
  <div
    v-loading="screen.isLoading"
    class="screen-item"
    @click="click"
  >
    <template v-if="screen.deviceId">
      <LivePlayer v-if="screen.isLive" :screen="screen" :has-close="true" :is-debug="true" @close="close" />
      <ReplayPlayer v-else :screen="screen" :has-close="true" :is-debug="true" @close="close" />
    </template>
    <div v-else class="tip-text tip-select-device">
      <el-button type="text" @click="selectDevice">请选择设备</el-button>
    </div>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
// import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
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

  public dialogs = {
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
  public selectDevice() {
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
