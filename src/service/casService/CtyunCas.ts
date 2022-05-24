import BaseCas from './BaseCas'
import settings from '@/settings'
import router from '@/router'

export default class CtyunCas extends BaseCas {
  public static readonly TYPE = 'ctyun'
  public static readonly CONTAINER_ID = 'iam-console-container'
  static readonly LOGIN_URL = '/v1/cdn/callback'
  static readonly LOGOUT_URL = 'https://www.cdn.cn/sign/out'

  private static instance: CtyunCas
  public static getInstance(container: HTMLElement) {
    if (!this.instance) {
      this.instance = new CtyunCas(container, CtyunCas.TYPE, CtcloudLayout, CtcloudLayout.consoleLayout)
    }
    return this.instance
  }

  /**
   * 设置全局container的ID为特定单点登录方式的挂载id
   */
  public setContainerId() {
    this.container.id = CtyunCas.CONTAINER_ID
  }

  /**
   * 检查用户是否登录
   * @returns 用户信息Promise
   */
  public auth() {
    return this.casLayout.getPublicInfo().authCurrentPromise
  }

  /**
   * 根据路由表构造菜单数据
   * @param routes 路由表
   * @param parentPath
   * @returns 菜单数组
   */
  public generateRouteMenu(routes, parentPath = '', items = []) {
    routes.forEach(route => {
      const path = parentPath ? `${parentPath}/${route.path}` : route.path
      route.children && this.generateRouteMenu(route.children, path, items)
      items.push({
        menuCode: path,
        menuId: path,
        parentId: parentPath || '0',
        name: route.meta.title,
        href: '#' + path
      })
    })
    return items
  }

  /**
   * 渲染cas左侧菜单
   */
  public renderMenu(items) {
    const getMenuPromise = new Promise(resolve => {
      resolve({
        title: settings.title,
        list: items
      })
    })
    this.casConsole.fetchMenuData({
      getMenuPromise
    })
    // cas菜单点击后按spa模式跳转
    this.casLayout.config({
      pushHash: (route: any) => {
        if (router.currentRoute.path) {
          router.push({
            path: route.code
          })
        }
      }
    })
  }

  /**
   * 高亮左侧菜单
   * @param route 路由对象
   */
  public activeMenu(route) {
    this.casConsole.match({
      key: route.path
    })
  }
}
