import { Component, Vue, Prop } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import { getAppList } from '@/api/ai-app'
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

  public goToApp(appid: any) {
    const addr = this.$router.resolve({
      name: 'AI-AppDetail',
      query: {
        appid,
        tabNum: '1'
      }
    })
    window.open(addr.href, '_blank')
  }

  public async getAiApps() {
    const { aiApps } = await getAppList({ pageSize: 3000 })
    let algoSet = new Set()
    let aiInfos = []
    aiApps.forEach(app => {
      if (algoSet.has(app.abilityId)) {
        aiInfos[aiInfos.findIndex(value => value.id === app.abilityId)].apps.push(app)
      } else {
        aiInfos.push({ id: app.abilityId, name: app.abilityName, apps: [app] })
      }
      algoSet.add(app.abilityId)
    })
    return aiInfos
  }
}
