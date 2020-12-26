import { clearInterval } from 'timers'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class DashboardMixin extends Vue {
  public intervalInstance: any = null
  public intervalTime = 10 * 1000

  public destroy() {
    this.intervalInstance && clearInterval(this.intervalInstance)
  }

  public setInterval(func: Function) {
    func()
    this.intervalInstance = setInterval(func, this.intervalTime)
  }
}
