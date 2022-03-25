<template>
  <div
    v-if="screenManager"
    class="screen-container"
    :class="{'screen-container--fullscreen': isFullscreen, 'screen-container--live': isLive, 'screen-container--replay': !isLive}"
  >
    <div v-if="screenManager.view === 'screen'" class="screen-grid-wrap">
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
    <ScreenList v-else />
    <ScreenTools />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from 'vue-property-decorator'
import { ScreenModule } from '@/store/modules/screen'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'
import ScreenItem from './ScreenItem.vue'
import ScreenList from './ScreenList.vue'
import ScreenTools from './ScreenTools.vue'
import PtzControl from './components/PtzControl.vue'

@Component({
  name: 'ScreenBoard',
  components: {
    ScreenItem,
    ScreenList,
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

  @Prop({
    default: 4
  })
  private defaultSize: number

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

  /* 是否全部静音的状态 */
  private get isMutedAll() {
    return ScreenModule.isMutedAll
  }

  /* 是否全屏 */
  private get isFullscreen() {
    return ScreenModule.isFullscreen
  }

  /* 获取分屏管理器Provide */
  @Provide('getScreenManager')
  private getScreenManager() {
    return this.screenManager
  }

  /**
   * 监听是否全部静音的状态
   * true: 静音所有窗口
   * false: 恢复之前窗口的静音状态
   */
  @Watch('isMutedAll')
  private onIsMutedAllChange(isMutedAll) {
    if (isMutedAll !== null) {
      if (isMutedAll) {
        this.screenManager.toggleAllMuteStatus(isMutedAll)
      } else {
        this.screenManager.restoreAllMuteStatus()
      }
      ScreenModule.SetIsMutedAll(null)
    }
  }

  private created() {
    this.screenManager = new ScreenManager({
      size: this.defaultSize,
      layout: this.defaultSize.toString(),
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
