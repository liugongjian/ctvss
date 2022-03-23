<template>
  <div class="screen-tools">
    <div class="screen-tools__bar" :class="{'hidden-axis': !showAxis}">
      <div class="screen-tools__bar__left">
        <QueueExecutor />
        <template v-if="showAxis">
          <Sync v-if="showScreenTool" />
          <DatePicker v-if="showDatePicker" :screen="currentScreen" />
          <ReplayType v-if="showDatePicker" :screen="currentScreen" />
        </template>
      </div>
      <div class="screen-tools__bar__right">
        <Cleaner v-if="showScreenTool" />
        <SizeSelector v-if="showScreenTool" />
        <Fullscreen :is-fullscreen="isFullscreen" @change="onFullscreenChange" />
        <ViewSelector v-if="!isLive" />
      </div>
    </div>
    <ReplayAxis v-if="showAxis" :screen="currentScreen" :disabled="!(currentScreen && currentScreen.deviceId) && !screenManager.isSync" @change="onAxisTimeChange" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
import { ScreenModule } from '@/store/modules/screen'
import ReplayAxis from '../ReplayPlayer/ReplayAxis.vue'
import QueueExecutor from './components/QueueExecutor.vue'
import DatePicker from './components/DatePicker.vue'
import ReplayType from './components/ReplayType.vue'
import Sync from './components/Sync.vue'
import Cleaner from './components/Cleaner.vue'
import SizeSelector from './components/SizeSelector.vue'
import Fullscreen from './components/Fullscreen.vue'
import ViewSelector from './components/ViewSelector.vue'

@Component({
  name: 'ScreenTools',
  components: {
    QueueExecutor,
    ReplayAxis,
    DatePicker,
    ReplayType,
    Sync,
    Cleaner,
    SizeSelector,
    Fullscreen,
    ViewSelector
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

  /* 是否为实时预览 */
  private get isLive() {
    return this.screenManager.isLive
  }

  /* 当为录像回放，并且视图为screen时显示时间轴和相关控件 */
  private get showAxis() {
    return !this.isLive && this.screenManager.view === 'screen'
  }

  /* 是否显示日历组件 */
  private get showDatePicker() {
    // 单屏显示时
    if (this.screenManager.isSingle) {
      return true
    }
    // 选中窗口，并且窗口有设备，或者选中同步向；并且全屏时
    if (((this.currentScreen && this.currentScreen.deviceId) || this.screenManager.isSync) && this.isFullscreen) {
      return true
    }
    return false
  }

  /* 单屏模式下不显示分屏工具 */
  private get showScreenTool() {
    return !this.screenManager.isSingle
  }

  /* 是否全屏 */
  private get isFullscreen() {
    return ScreenModule.isFullscreen
  }

  /**
   * 时间轴Seek
   */
  private onAxisTimeChange(time: number) {
    if (this.screenManager.isSync) {
      this.screenManager.screenList.forEach(screen => {
        screen.recordManager.seek(time)
      })
    } else {
      this.currentScreen.recordManager.seek(time)
    }
  }

  /**
   * 全屏操作
   */
  private onFullscreenChange(isFullscreen) {
    ScreenModule.SetIsFullscreen(isFullscreen)
  }
}
</script>
