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
    const name = this.$vnode.componentOptions.tag.toLowerCase()
    this.screenManager.refs[name] = this
  }
}
