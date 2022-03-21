<template>
  <div class="screen-list">
    <div v-if="currentScreen.deviceId">
      {{ currentScreen.deviceName }}
    </div>
    <div v-else class="tip-select-device">
      <el-button type="text" @click="selectDevice">请选择设备</el-button>
    </div>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
import DeviceDir from '../dialogs/DeviceDir.vue'

@Component({
  name: 'ScreenList',
  components: {
    DeviceDir
  }
})
export default class extends Vue {
  @Inject('getScreenManager')
  private getScreenManager: Function

  private get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  private get currentScreen() {
    return this.screenManager.currentScreen
  }

  private dialogs = {
    deviceDir: false
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
  private onDeviceDirClose(item) {
    this.dialogs.deviceDir = false
    if (item) {
      this.screenManager.openTreeItem(item)
    }
  }
}
</script>
