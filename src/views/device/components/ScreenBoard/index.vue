<template>
  <div v-if="screenManager" class="screen-container">
    <div class="screen-grid-wrap">
      <div class="screen-grid" :class="`screen-size--${size}`">
        <ScreenItem
          v-for="(screen, index) in screenList"
          :key="index"
          :screen="screen"
          :has-live-replay-selector="true"
          :style="`grid-area: item${index}`"
          :class="[{'actived': index === currentIndex && screenList.length > 1}]"
          @click="selectScreen(index)"
        />
      </div>
      <PtzControl v-if="isLive" :screen="currentScreen" />
    </div>
    <ScreenTools />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Provide } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
import ScreenItem from './ScreenItem.vue'
import ScreenTools from './ScreenTools.vue'
import PtzControl from './components/PtzControl.vue'

@Component({
  name: 'ScreenBoard',
  components: {
    ScreenItem,
    ScreenTools,
    PtzControl
  }
})
export default class extends Vue {
  @Prop({
    default: true
  })
  private isLive: boolean

  @Prop()
  private inProtocol: string

  /* 分屏管理器 */
  public screenManager: ScreenManager = null

  /* 分屏列表 */
  private get screenList() {
    return this.screenManager && this.screenManager.screenList
  }

  /* 当前选中的索引 */
  private get currentIndex() {
    return this.screenManager && this.screenManager.currentIndex
  }

  /* 当前选中的分屏 */
  private get currentScreen() {
    return this.screenManager && this.screenManager.currentScreen
  }

  /* 分屏数 */
  private get size() {
    return this.screenManager && this.screenManager.size
  }

  /* 获取分屏管理器Provide */
  @Provide('getScreenManager')
  private getScreenManager() {
    return this.screenManager
  }

  private created() {
    this.screenManager = new ScreenManager({
      size: 4,
      layout: '4',
      isLive: this.isLive,
      inProtocol: this.inProtocol
    })
  }

  private destroyed() {
    window.removeEventListener('resize', this.calMaxHeight)
    window.removeEventListener('resize', this.checkFullscreen)
  }

  /**
   * 选择分屏
   */
  public selectScreen(index: number) {
    this.screenManager.currentIndex = index
  }
}
</script>
