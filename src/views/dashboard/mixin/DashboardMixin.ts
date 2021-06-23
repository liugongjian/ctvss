import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class DashboardMixin extends Vue {
  @Prop() public height: any

  @Prop() public mainUserId?: string

  private intervalInstance: any = null
  public intervalTime = 15 * 1000

  private destroyed() {
    this.destroy()
  }

  public destroy() {
    this.intervalInstance && clearInterval(this.intervalInstance)
  }

  public setInterval(func: Function) {
    func()
    this.intervalInstance = setInterval(func, this.intervalTime)
  }
}
