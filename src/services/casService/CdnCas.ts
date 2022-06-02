import BaseCas from './BaseCas'
import settings from '@/settings'
import router from '@/router'

export default class CdnCas extends BaseCas {
  static readonly TYPE = 'ctcdn'
  static readonly TYPE_CN = '天翼云-CDN+'
  static readonly CONTAINER_ID = 'iam-console-container'
  static readonly LOGIN_URL = '/v1/cas/iamcallback'
  static readonly LOGOUT_URL = '/iam/sign/out'

  private static instance: CdnCas
  public static getInstance() {
    if (!this.instance) {
      this.instance = new CdnCas(AlogicLayout, AlogicLayout.consoleContainer)
    }
    return this.instance
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(casLayout: any, casConsole: any) {
    super(casLayout, casConsole)
  }

  /**
   * 设置全局container的ID为特定单点登录方式的挂载id
   */
  public setContainerId(container) {
    container.id = CdnCas.CONTAINER_ID
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
  public generateMenuData(routes) {
    const result = []
    routes.forEach(route => {
      const currentHidden = !route.meta.alwaysShow && route.children && route.children.length <= 1
      let items = []
      if (!currentHidden) {
        result.push({
          name: route.meta.title,
          menuId: route.path,
          ucode: route.path,
          href: route.path,
          items
        })
      } else {
        items = result
      }
      route.children && route.children.forEach(childRoute => {
        const path = `${route.path}${childRoute.path ? '/' + childRoute.path : ''}`
        items.push({
          name: childRoute.meta.title,
          menuId: path,
          ucode: path,
          href: path
        })
      })
    })
    return result
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
      topic: 'workspace',
      workspaceId: '0',
      mainMenuPromise,
      sidebarMenuPromise: Promise.resolve([
        {
          'icon': 'icon-cloud-service-vision-service',
          'name': '视频监控',
          'href': 'https://console.vcn.ctcdn.cn/vss',
          'ucode': 'vss'
        }
      ])
    })
    // cas菜单点击后按spa模式跳转
    this.casLayout.setConfig({
      mode: 'hash',
      routePush: (route: any) => {
        if (router.currentRoute.path !== route) {
          router.push({
            path: route
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
      key: route.meta.activeMenu || ('/' + route.name)
    })
  }
}
