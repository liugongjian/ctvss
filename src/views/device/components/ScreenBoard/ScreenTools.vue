<template>
  <div class="screen-tools">
    <div class="screen-tools__bar" :class="{'hidden-axis': !showAxis}">
      <div class="screen-tools__bar__left">
        <QueueExecutor />
        <template v-if="showAxis">
          <Sync />
          <DatePicker v-if="currentScreen" :screen="currentScreen" />
          <ReplayType v-if="currentScreen" :screen="currentScreen" />
        </template>
      </div>
      <div class="screen-tools__bar__right">
        <Cleaner v-if="showAxis" />
        <SizeSelector />
        <Fullscreen />
        <ViewSelector />
      </div>
    </div>
    <ReplayAxis v-if="showAxis" :screen="currentScreen" @change="onAxisTimeChange" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
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

  /**
   * 当为录像回放，并且视图为screen时显示时间轴和相关控件
   */
  private get showAxis() {
    return !this.screenManager.isLive && this.screenManager.view === 'screen'
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
}
</script>
