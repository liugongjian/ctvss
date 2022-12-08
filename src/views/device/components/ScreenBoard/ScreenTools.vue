<template>
  <div class="screen-tools" :class="{'hidden-axis': !showAxis}">
    <div class="screen-tools__bar">
      <div class="screen-tools__bar__left">
        <QueueExecutor />
        <template v-if="showAxis">
          <Sync v-if="showScreenTool" />
          <DatePicker v-if="showDatePicker" :screen="currentScreen" :disabled="!enableAxis" @change="onDateChange" />
          <ReplayType v-if="showDatePicker && !isCarTask" :screen="currentScreen" :disabled="!enableAxis" @change="onReplayTypeChange" />
        </template>
      </div>
      <div class="screen-tools__bar__right">
        <el-button v-if="inspectionFlag" class="screen-tools__bar__right_inspection" type="primary" size="mini" @click="gotoInspection">巡检考核</el-button>
        <Cleaner v-if="showScreenTool && isScreenView" :disabled="isPolling" />
        <SizeSelector v-if="showScreenTool && isScreenView" :disabled="isPolling" />
        <Fullscreen v-if="isScreenView" :is-fullscreen="isFullscreen" @change="onFullscreenChange" />
        <ViewSelector v-if="!isLive && !isFullscreen && currentScreen.recordType !== 1 && !isCarTask" :screen="currentScreen" />
      </div>
    </div>
    <ReplayAxis v-if="showAxis" :screen="currentScreen" :disabled="!enableAxis" @change="onAxisTimeChange" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/services/Screen/ScreenManager'
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

  private get inspectionFlag() {
    return this.$store.state.user.tags.showInspection === 'Y'
  }

  /* 是否为实时预览 */
  private get isLive() {
    return this.screenManager.isLive
  }

  /* 是否为分屏视图 */
  private get isScreenView() {
    return this.screenManager.view === 'screen'
  }

  /* 当为录像回放，并且视图为screen时显示时间轴和相关控件 */
  private get showAxis() {
    return !this.isLive && this.isScreenView
  }

  /* 是否启用时间轴 */
  private get enableAxis() {
    return (this.currentScreen && this.currentScreen.deviceId && !this.currentScreen.isLive) || this.screenManager.isSync
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
   * 是否处于轮询状态
   */
  private get isPolling() {
    return this.screenManager.executeQueueConfig.status !== 'free'
  }

  /**
   * 是否是车辆管理中的录像回放，是则隐去部分功能按钮
   *  */
  private get isCarTask() {
    return this.screenManager.isCarTask
  }

  /**
   * 时间轴Seek
   */
  private onAxisTimeChange(time: number) {
    this.screenManager.changeReplayTime(time)
  }

  /**
   * 切换日期
   */
  private onDateChange(date) {
    this.screenManager.changeReplayDate(date)
  }

  /**
   * 切换录像类型
   */
  private onReplayTypeChange(recordType) {
    this.screenManager.changeReplayType(recordType)
  }

  /**
   * 全屏操作
   */
  private onFullscreenChange(isFullscreen) {
    ScreenModule.SetIsFullscreen(isFullscreen)
  }

  /**
   * 大连烟草‘巡检考核’跳转
   */
  private gotoInspection() {
    window.open('https://server.deepmatrix.cn/mobile/app/887c173d-652f-49b6-b8f6-7d5edfaa595d', '_blank')
  }
}
</script>
<style lang="scss" scoped>
  .screen-tools__bar__right_inspection {
    margin-right: 3px;
    height: 27px;
    margin-top: 3px;
  }
</style>
