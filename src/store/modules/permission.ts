import { asyncRoutes, constantRoutes } from '@/router'
import casService from '@/services/casService'
import store from '@/store'
import { getLocalStorage } from '@/utils/storage'
import { RouteConfig } from 'vue-router'
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'

interface IMatchFn {
  (infos: string[], route: RouteConfig): boolean
}

const notInDenyPerms: IMatchFn = (denyPerms, route) => {
  if (route.meta && route.meta.perms) {
    return !denyPerms.some(denyPerm => route.meta.perms.includes(denyPerm))
  }
  return true
}

const hasPermission: IMatchFn = (perms, route) => {
  if (route.meta && route.meta.perms) {
    return perms.some(perm => route.meta.perms.includes(perm))
  }
  return true
}

const hasTags: IMatchFn = (tags, route) => {
  if (route.meta && route.meta.tags) {
    return route.meta.tags.every(neededTag => tags.indexOf(neededTag) !== -1)
  }
  return true
}

const filterAsyncRoutes = (matchFn: IMatchFn, routes: RouteConfig[], infos: string[]) => {
  const res: RouteConfig[] = []
  routes.forEach(route => {
    const r = { ...route }
    if (matchFn(infos, r)) {
      if (r.children) {
        r.children = filterAsyncRoutes(matchFn, r.children, infos)
      }
      res.push(r)
    }
  })
  return res
}

export const filterAsyncRoutesByPerms = filterAsyncRoutes.bind(null, hasPermission)
export const filterAsyncRoutesByDenyPerms = filterAsyncRoutes.bind(null, notInDenyPerms)
export const filterAsyncRoutesByTags = filterAsyncRoutes.bind(null, hasTags)

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
  public GenerateRoutes(params: { tags: string[], perms: string[], denyPerms: string[], iamUserId: string }) {
    let accessedRoutes
    let filteredRoutes = asyncRoutes
    if (params.iamUserId) {
      filteredRoutes = filteredRoutes.filter(route => route.path !== '/access-manage' && route.path !== '/operation-log')
      // 子账号管理员，过滤 自定义设备树 & 录像锁定管理 二级菜单
      const sysconfigRouteIndex = filteredRoutes.findIndex(route => route.path === '/sysconfig')
      if (sysconfigRouteIndex > -1) {
        const sysconfigRoute = filteredRoutes[sysconfigRouteIndex]
        sysconfigRoute.children = sysconfigRoute.children.filter(child => child.path !== '/custom-tree' && child.path !== '/replay-lock-manage')
      }
    }

    // 根据route.meta.tags及用户tags过滤路由
    filteredRoutes = filterAsyncRoutesByTags(filteredRoutes, params.tags)

    if (params.perms.includes('*')) {
      accessedRoutes = filteredRoutes
    } else {
      accessedRoutes = filterAsyncRoutesByPerms(filteredRoutes, params.perms)
    }
    accessedRoutes = filterAsyncRoutesByDenyPerms(accessedRoutes, params.denyPerms)
    this.SET_ROUTES(accessedRoutes)
    if (getLocalStorage('casLoginId')) {
      casService.renderCasMenu(this.routes)
    }
  }
}

export const PermissionModule = getModule(Permission)
