import { Component, Vue, Inject } from 'vue-property-decorator'
import { ScreenManager } from '@vss/device/services/Screen/ScreenManager'

@Component
export default class ComponentMixin extends Vue {
  @Inject('getScreenManager')
  public getScreenManager: Function

  public get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  public get currentScreen() {
    return this.screenManager.currentScreen
  }

  public created() {
    const tag: string = this.$vnode.componentOptions.tag
    const name = tag.substring(0, 1).toLowerCase() + tag.substring(1)
    this.screenManager.refs[name] = this
  }
}
