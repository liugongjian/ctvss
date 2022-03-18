<template>
  <div class="screen-tools">
    <div class="screen-tools__bar">
      <div class="screen-tools__bar__left">
        <QueueExecutor />
        <Sync />
      </div>
      <div class="screen-tools__bar__left">
        <Cleaner />
        <SizeSelector />
      </div>
    </div>
    <ReplayAxis :screen="screen" @change="onAxisTimeChange" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
import ReplayAxis from '../ReplayPlayer/ReplayAxis.vue'
import QueueExecutor from './components/QueueExecutor.vue'
import Sync from './components/Sync.vue'
import Cleaner from './components/Cleaner.vue'
import SizeSelector from './components/SizeSelector.vue'

@Component({
  name: 'ScreenTools',
  components: {
    QueueExecutor,
    ReplayAxis,
    Sync,
    Cleaner,
    SizeSelector
  }
})
export default class extends Vue {
  @Inject('getScreenManager')
  public getScreenManager: Function

  public get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  public get screen() {
    return this.screenManager.currentScreen
  }

  private onAxisTimeChange(time: number) {
    if (this.screenManager.isSync) {
      this.screenManager.screenList.forEach(screen => {
        screen.seek(time)
      })
    } else {
      this.screen.seek(time)
    }
  }
}
</script>
<style lang="scss" scoped>
.screen-tools {
  &__bar {
    display: flex;

    &__left {
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
