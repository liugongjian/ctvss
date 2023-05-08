import BaseCas from './BaseCas'
import settings from '@/settings'
import router from '@/router'

export default class CtyunCas extends BaseCas {
  static readonly TYPE = 'ctyun'
  static readonly TYPE_CN = '天翼云'
  static readonly CONTAINER_ID = 'ctcloud-console'
  static readonly LOGIN_URL = '/v1/cas/callback'
  static readonly LOGOUT_URL = 'https://www.ctyun.cn/sign/out'

  private static instance: CtyunCas
  public static getInstance() {
    if (!this.instance) {
      this.instance = new CtyunCas(CtcloudLayout, CtcloudLayout.consoleLayout)
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
    container.id = CtyunCas.CONTAINER_ID
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
  public generateMenuData(routes) {
    const result = []
    routes.forEach(route => {
      const currentHidden = !route.meta.alwaysShow && route.children && route.children.length <= 1
      if (!currentHidden) {
        result.push({
          name: route.meta.title,
          menuCode: route.path,
          menuId: route.path,
          parentId: '0',
          href: '#' + route.path
        })
      }
      route.children && route.children.forEach(childRoute => {
        const path = `${route.path}${childRoute.path ? '/' + childRoute.path : ''}`
        result.push({
          name: childRoute.meta.title,
          menuCode: path,
          menuId: path,
          parentId: currentHidden ? '0' : route.path,
          href: '#' + path
        })
      })
    })
    return result
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
        if (router.currentRoute.path !== route.code) {
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
      key: route.meta.activeMenu || ('/' + route.name)
    })
  }
}
