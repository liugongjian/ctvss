import BaseCas from './BaseCas'
import settings from '@/settings'
import router from '@/router'

export default class CdnCas extends BaseCas {
  static readonly TYPE = 'ctcdn'
  static readonly TYPE_CN = '天翼云-CDN+'
  static readonly CONTAINER_ID = 'iam-console-container'
  static readonly LOGIN_URL = '/v2/cas/iamcallback'
  static readonly LOGOUT_URL = 'https://iam-cbip.ctcdn.cn:8843/iam/sign/out'

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mainMenuPromise = new Promise(resolve => {
      resolve({
        title: settings.title,
        list: items
      })
    })
    this.casConsole.updateMenu({
      topic: 'workspace',
      workspaceId: '0',
      // mainMenuPromise,
      sidebarMenuPromise: Promise.resolve([
        {
          'icon': 'el-icon-wind-power',
          'name': 'IAM服务',
          'href': 'https://iam-cbip.ctcdn.cn:8843/',
          'ucode': 'iam-cbip'
        },
        {
          'icon': 'el-icon-cpu',
          'name': '诸葛AI控制台',
          'href': 'https://aiconsole-cbip.ctcdn.cn:8843/console',
          'ucode': 'aiconsole-cbip'
        },
        {
          'icon': 'el-icon-data-analysis',
          'name': '天翼大屏',
          'href': 'https://datav-cbip.ctcdn.cn:8843/dashboard',
          'ucode': 'datav-cbip'
        },
        {
          'icon': 'el-icon-set-up',
          'name': '大数据运维管理平台',
          'href': 'https://mozi-cbip.ctcdn.cn:8843/',
          'ucode': 'mozi-cbip'
        },
        {
          'icon': 'el-icon-lock',
          'name': '数据安全管理平台',
          'href': 'https://dsmp-cbip.ctcdn.cn:8843/',
          'ucode': 'dsmp-cbip'
        },
        {
          'icon': 'el-icon-coin',
          'name': '数据中台',
          'href': 'https://bdmp-cbip.ctcdn.cn:8843/control',
          'ucode': 'bdmp-cbip'
        },
        {
          'icon': 'el-icon-video-camera',
          'name': '大视频平台',
          'href': 'https://console.vcn.ctcdn.cn/vss',
          'ucode': 'vss'
        }
      ])
    })
    this.casLayout.setConfig({
      mode: 'hash',
      routePush: (route: any) => {
        if (router.currentRoute.path !== route) {
          if (route === '/iam/sign/out') {
            window.location.href = 'https://iam-cbip.ctcdn.cn:8843' + route
          } else if (route.startsWith('https://')) {
            window.location.href = route
          } else {
            router.push({
              path: route
            })
          }
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
      key: route.meta.activeMenu || ('/' + route.name),
      domain: 'vss'
    })
  }
}
