export default abstract class BaseCas {
  // eslint-disable-next-line no-useless-constructor
  constructor(public casLayout: any, public casConsole: any) {
  }

  /**
   * 设置全局container的ID为指定cas的挂载id
   */
  abstract setContainerId(container: Element): any

  /**
   * 检查用户是否登录
   * @returns 用户信息Promise
   */
  abstract auth(): Promise<any>

  /**
   * 初始化页面框架
   */
  public init(containerId: string) {
    const container = document.querySelector(containerId)
    this.setContainerId(container)
    this.casConsole.init()
  }

  /**
   * 根据路由表构造菜单数据
   * @param routes 路由表
   * @param parentPath
   * @return 菜单数组
   */
  abstract generateMenuData(routes: Array<any>): Array<any>

  /**
   * 渲染左侧菜单
   */
  abstract renderMenu(menuData: Array<any>): any

  /**
   * 使用路由表渲染左侧菜单
   */
  public renderMenuByRoute(routes) {
    const menuData = this.generateMenuData(routes)
    this.renderMenu(menuData)
  }

  /**
   * 高亮左侧菜单
   * @param route 路由对象
   */
  abstract activeMenu(route): any
}
