import { asyncRoutes, constantRoutes, resetRouter } from '@/router'
import casService from '@/services/casService'
import store from '@/store'
import { getLocalStorage } from '@/utils/storage'
import { RouteConfig } from 'vue-router'
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'

interface IMatchFn {
  (infos: string[], route: RouteConfig): boolean
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

const hasPlugins: IMatchFn = (plugins, route) => {
  if (route.meta && route.meta.plugins) {
    return route.meta.plugins.every(neededPlugin => plugins.indexOf(neededPlugin) !== -1)
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
export const filterAsyncRoutesByTags = filterAsyncRoutes.bind(null, hasTags)
export const filterAsyncRoutesByPlugins = filterAsyncRoutes.bind(null, hasPlugins)

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
  public GenerateRoutes(params: { tags: string[], plugins: string[], perms: string[], iamUserId: string }) {
    let accessedRoutes
    let filteredRoutes = asyncRoutes
    if (params.iamUserId) {
      filteredRoutes = filteredRoutes.filter(route => route.path !== '/access-manage')
    }

    // 根据route.meta.tags及用户tags过滤路由
    filteredRoutes = filterAsyncRoutesByTags(filteredRoutes, params.tags)
    // 根据route.meta.plugins及用户plugins过滤路由
    filteredRoutes = filterAsyncRoutesByPlugins(filteredRoutes, params.plugins)
    filteredRoutes.forEach((route: any) => {
      if (route.path === '/device' && route.children && route.children.length === 1) {
        route.children[0].meta.title = '设备管理'
      }
    })

    if (params.perms.includes('*')) {
      accessedRoutes = filteredRoutes
    } else {
      accessedRoutes = filterAsyncRoutesByPerms(filteredRoutes, params.perms)
    }
    this.SET_ROUTES(accessedRoutes)
    if (getLocalStorage('casLoginId')) {
      casService.renderCasMenu(this.routes)
    }
  }
}

export const PermissionModule = getModule(Permission)
