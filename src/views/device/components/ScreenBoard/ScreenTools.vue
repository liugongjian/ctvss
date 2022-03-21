<template>
  <div class="screen-tools">
    <div class="screen-tools__bar">
      <div class="screen-tools__bar__left">
        <QueueExecutor />
        <template v-if="!isLive">
          <Sync />
          <DatePicker v-if="currentScreen" :screen="currentScreen" />
          <ReplayType v-if="currentScreen" :screen="currentScreen" />
        </template>
      </div>
      <div class="screen-tools__bar__right">
        <Cleaner />
        <SizeSelector />
        <Fullscreen />
        <ViewSelector />
      </div>
    </div>
    <ReplayAxis v-if="!isLive" :screen="currentScreen" @change="onAxisTimeChange" />
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

  private get isLive() {
    return this.screenManager.isLive
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
<style lang="scss" scoped>
.screen-tools {
  &__bar {
    display: flex;
    justify-content: space-between;

    &__left, &__right {
      display: flex;
    }
  }

  ::v-deep &__btn {
    display: flex;
    padding: 0 4px;
    margin: 0 3px;
    height: 35px;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &.selected {
      color: $primary;
    }
  }
}
</style>
