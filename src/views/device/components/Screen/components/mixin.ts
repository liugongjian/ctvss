import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { ScreenManager } from '@/views/device/models/Screen/ScreenManager'

@Component
export default class ComponentMixin extends Vue {
  @Inject('getScreenManager')
  public getScreenManager: Function

  public get screenManager(): ScreenManager {
    return this.getScreenManager()
  }

  @Watch('screenManager')
  public onScreenManagerCreate() {
    const tag: string = this.$vnode.componentOptions.tag
    const name = tag.substring(0, 1).toLowerCase() + tag.substring(1)
    this.screenManager.refs[name] = this
  }
}
