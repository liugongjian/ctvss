<template>
  <div class="screen-list">
    <div v-if="currentScreen.deviceId">
      {{ currentScreen.deviceName }}
      {{ recordList }}
      <!--原来的表格-->
    </div>
    <div v-else class="tip-select-device">
      <el-button type="text" @click="selectDevice">请选择设备</el-button>
    </div>
    <device-dir v-if="dialogs.deviceDir" @on-close="onDeviceDirClose" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { Record } from '@/views/device/models/Record/Record'
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

  private recordList: Record[] = null

  private get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  private get currentScreen() {
    return this.screenManager.currentScreen
  }

  @Watch('currentScreen.deviceId')
  private onDeviceChange() {
    this.recordList = this.currentScreen.recordManager.getRecordListByPage(0)
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
