import { Component, Mixins } from 'vue-property-decorator'
import IndexMixin from './indexMixin'
import { ScreenManager } from '../services/Screen/ScreenManager'
import ScreenBoard from '../components/ScreenBoard/index.vue'

@Component({
  name: 'Screen',
  components: {
    ScreenBoard
  }
})
export default class ScreenMixin extends Mixins(IndexMixin) {
  public screenManager: ScreenManager = null

  /* 当前选中的分屏 */
  public get currentScreen() {
    return this.screenManager && this.screenManager.currentScreen
  }

  public mounted() {
    const screenBoard = this.$refs.screenBoard as ScreenBoard
    // @ts-ignore
    this.screenManager = screenBoard!.screenManager
    this.calMaxHeight()
    window.addEventListener('resize', this.calMaxHeight)
    window.addEventListener('beforeunload', this.saveCache)
  }

  public destroyed() {
    this.screenManager.saveCache()
    window.removeEventListener('resize', this.calMaxHeight)
    window.removeEventListener('beforeunload', this.saveCache)
  }

  /**
   * 保存分屏缓存
   */
  private saveCache() {
    this.screenManager.saveCache()
  }
}
