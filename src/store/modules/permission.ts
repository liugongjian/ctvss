import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { RouteConfig } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router'
import store from '@/store'
import { getLocalStorage } from '@/utils/storage'

const hasPermission = (perms: string[], route: RouteConfig) => {
  if (route.meta && route.meta.perms) {
    return perms.some(perm => route.meta.perms.includes(perm))
  } else {
    return true
  }
}

const generateCTMenuData = (routes: RouteConfig[]) => {
  const filteredRoutes = filterCTMenu(routes)
  const p = new Promise(resolve => {
    const ctMenuList = []
    for (let i = 0; i < filteredRoutes.length; i++) {
      const route = filteredRoutes[i]
      if (!route.meta.alwaysShow && route.children && route.children.length === 1) {
        const child = route.children[0]
        ctMenuList.push({
          name: child.meta.title,
          menuCode: `${route.path + (child.path ? '/' + child.path : '')}`,
          parentId: '0',
          module: 'menu',
          renderer: 'menu',
          hrefLocal: `#${route.path + (child.path ? '/' + child.path : '')}`,
          href: `#${route.path + (child.path ? '/' + child.path : '')}`,
          domain: '',
          displayOrder: 0,
          menuId: child.meta.id
        })
      } else {
        ctMenuList.push({
          name: route.meta.title,
          menuCode: `${route.path}`,
          parentId: '0',
          module: 'menu',
          renderer: 'menu',
          hrefLocal: `#${route.path}`,
          href: `#${route.path}`,
          domain: '',
          dispalyOrder: 0,
          menuId: route.meta.id
        })
        route.children && route.children.forEach(child => {
          ctMenuList.push({
            name: child.meta.title,
            menuCode: `${route.path + (child.path ? '/' + child.path : '')}`,
            parentId: route.meta.id,
            module: 'menu',
            renderer: 'menu',
            hrefLocal: `#${route.path + (child.path ? '/' + child.path : '')}`,
            href: `#${route.path + (child.path ? '/' + child.path : '')}`,
            domain: '',
            displayOrder: 0,
            menuId: child.meta.id
          })
        })
      }
    }
    resolve({
      title: '视频监控',
      list: ctMenuList
    })
    console.log('ctMenuList: ', ctMenuList)
  })
  CtcloudLayout.consoleLayout.fetchMenuData({
    getMenuPromise: p
  })
}

const filterCTMenu = (routes: RouteConfig[]) => {
  const result: RouteConfig[] = []
  routes.forEach(route => {
    if (route.meta && route.meta.hidden) {
      return
    }
    const temp = { ...route }
    if (temp.children) {
      temp.children = filterCTMenu(temp.children)
      if (temp.children && temp.children.length) {
        result.push(temp)
      }
    } else {
      temp.meta.hidden !== true && result.push(temp)
    }
  })
  return result
}

export const filterAsyncRoutes = (routes: RouteConfig[], perms: string[]) => {
  const res: RouteConfig[] = []
  routes.forEach(route => {
    const r = { ...route }
    if (hasPermission(perms, r)) {
      if (r.children) {
        r.children = filterAsyncRoutes(r.children, perms)
      }
      res.push(r)
    }
    // iam3.0 分权分域版本注销该部分，改为使用原先的判断逻辑，自顶向下判断
    // if (r.children) {
    //   r.children = filterAsyncRoutes(r.children, perms)
    //   if (r.children && r.children.length > 0) {
    //     res.push(r)
    //   }
    // } else {
    //   if (hasPermission(perms, r)) {
    //     res.push(r)
    //   }
    // }
  })
  return res
}

export interface IPermissionState {
  routes: RouteConfig[]
  dynamicRoutes: RouteConfig[]
}

@Module({ dynamic: true, store, name: 'permission' })
class Permission extends VuexModule implements IPermissionState {
  public routes: RouteConfig[] = []
  public dynamicRoutes: RouteConfig[] = []

  @Mutation
  private SET_ROUTES(routes: RouteConfig[]) {
    this.routes = constantRoutes.concat(routes)
    this.dynamicRoutes = routes
  }

  @Action
  public GenerateRoutes(params: { perms: string[], iamUserId: string }) {
    let accessedRoutes
    let filteredRoutes = asyncRoutes
    if (params.iamUserId) {
      filteredRoutes = filteredRoutes.filter(route => route.path !== '/accessManage')
    }
    // TODO: 连州教育局一机一档专用
    if (store.state.user.tags && store.state.user.tags.isLianZhouEdu !== 'Y') {
      filteredRoutes = filteredRoutes.filter(route => route.path !== '/exportDevices')
    }
    // TODO: 重庆公租房客户显示电子地图
    if (store.state.user.tags && store.state.user.tags.showDigitalMap !== 'Y') {
      filteredRoutes = filteredRoutes.filter(route => route.path !== '/map')
    }
    if (params.perms.includes('*')) {
      accessedRoutes = filteredRoutes
    } else {
      accessedRoutes = filterAsyncRoutes(filteredRoutes, params.perms)
    }
    this.SET_ROUTES(accessedRoutes)
    if (getLocalStorage('ctLoginId')) {
      console.log('generateCTMenuData:', getLocalStorage('ctLoginId'))
      generateCTMenuData(this.routes)
    }
  }
}

export const PermissionModule = getModule(Permission)
