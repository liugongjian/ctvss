import { deleteApps, startOrStopApps } from '@/api/ai-app'
import { checkPermission } from '@vss/base/utils/permission'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class AppMixin extends Vue {
  public checkPermission = checkPermission
  public alarms: any = []
  public period: any = {
    periodType: '今天',
    period: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)]
  }
  public msOfADay = 864 * 100000

  /**
   * 刷新数据
   */
  public refresh() {}

  /**
   * 删除回调
   */
  public onDeleteApp() {}
  /**
   * 更新能力回调
   */
  public getAbilityList() {}

  /**
   * 查看详情
   */
  public appDetail(app: any, tabNum: any) {
    this.$router.push({
      name: 'AIAppDetail',
      query: {
        appid: app.id,
        tabNum
      }
    })
  }

  /**
   * 编辑
   */
  public editApp(app) {
    this.$router.push({
      name: 'AIEditApp',
      query: {
        id: app.id
      }
    })
  }

  /**
   * 删除应用
   */
  public deleteApp(app) {
    this.$alertDelete({
      type: '应用',
      msg: `删除操作不能恢复，确认删除AI应用"${app.name}"吗？`,
      method: deleteApps,
      payload: { id: [app.id] },
      onSuccess: () => {
        this.onDeleteApp()
        this.getAbilityList()
      }
    })
  }

  /**
   * 启动/停用设备
   */
  public async startOrStopApp(app, startOrStop) {
    try {
      const params: any = {
        id: [app.id],
        startOrStop
      }
      await startOrStopApps(params)
      const method = startOrStop ? '启用' : '停用'
      this.$message.success(`已通知${method}AI应用`)
      this.refresh()
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  public backToAppList() {
    this.$router.push({
      name: 'AIAppList'
    })
  }

  /**
   * 得到N天前的时间戳
   */
  public getDateBefore(dayCount) {
    let dd = new Date()
    dd.setDate(dd.getDate() - dayCount)
    let time = dd.setHours(0, 0, 0)
    return time
  }

  public getAlarms() {}

  /**
   * 告警搜索时间
   */
  public handleChange() {
    this.getAlarms()
  }
}
