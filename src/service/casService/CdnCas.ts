import BaseCas from './BaseCas'
import settings from '@/settings'

export default class CdnCas extends BaseCas {
  static readonly TYPE = 'ctcdn'
  static readonly CONTAINER_ID = 'iam-console-container'
  static readonly LOGIN_URL = '/v1/cas/callback'
  static readonly LOGOUT_URL = 'https://www.ctyun.cn/sign/out'

  private static instance: CdnCas
  public static getInstance(container: HTMLElement) {
    if (!this.instance) {
      this.instance = new CdnCas(container, CdnCas.TYPE, AlogicLayout, AlogicLayout.consoleContainer)
    }
    return this.instance
  }

  get loginURL() {
    return CdnCas.LOGIN_URL
  }

  get logoutURL() {
    return CdnCas.LOGOUT_URL
  }

  /**
   * 设置全局container的ID为特定单点登录方式的挂载id
   */
  public setContainerId() {
    this.container.id = CdnCas.CONTAINER_ID
  }

  /**
   * 检查用户是否登录
   * @returns 用户信息Promise
   */
  public auth() {
    return this.casLayout.authCurrentPromise
  }

  /**
   * 根据路由表构造菜单数据
   * @param routes 路由表
   * @param parentPath
   * @returns 菜单数组
   */
  public generateRouteMenu(routes, parentPath = '') {
    return routes.map(route => {
      const path = parentPath ? `${parentPath}/${route.path}` : route.path
      const items = route.children && this.generateRouteMenu(route.children, path)
      return {
        menuId: path,
        name: route.meta.title,
        ucode: path,
        href: path,
        items
      }
    })
  }

  /**
   * 渲染cas左侧菜单
   */
  public renderMenu(items: Array<any>): void {
    const mainMenuPromise = new Promise(resolve => {
      resolve({
        title: settings.title,
        list: items
      })
    })
    this.casConsole.updateMenu({
      mainMenuPromise
    })
  }

  /**
   * 高亮左侧菜单
   * @param route 路由对象
   */
  public activeMenu(route) {
    this.casConsole.math({
      key: route.path
    })
  }
}
