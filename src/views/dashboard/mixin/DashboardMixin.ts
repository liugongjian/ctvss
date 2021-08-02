import { Component, Vue, Prop } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'

@Component
export default class DashboardMixin extends Vue {
  @Prop() public height: any

  get mainUserId() {
    return UserModule.mainUserID
  }

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
