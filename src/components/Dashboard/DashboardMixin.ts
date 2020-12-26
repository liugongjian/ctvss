import { clearInterval } from 'timers'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class DashboardMixin extends Vue {
  @Prop() public height: any
  public intervalInstance: any = null
  public intervalTime = 5 * 1000

  public destroy() {
    this.intervalInstance && clearInterval(this.intervalInstance)
  }

  public setInterval(func: Function) {
    func()
    this.intervalInstance = setInterval(func, this.intervalTime)
  }
}
