import { Component, Vue } from 'vue-property-decorator'
import { startOrStopApps, deleteApps } from '@/api/ai-app'
import { checkPermission } from '@/utils/permission'

@Component
export default class AppMixin extends Vue {
  public checkPermission = checkPermission

  /**
   * 刷新数据
   */
  public refresh() {}

  /**
   * 删除回调
   */
  public onDeleteApp() {}

  /**
   * 查看详情
   */
  public appDetail(app: any, tabNum: any) {
    this.$router.push({
      name: 'AI-AppDetail',
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
      name: 'AI-EditApp',
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
}
