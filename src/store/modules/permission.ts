import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { RouteConfig } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router'
import store from '@/store'

const hasPermission = (perms: string[], route: RouteConfig) => {
  if (route.meta && route.meta.perms) {
    return perms.some(perm => route.meta.perms.includes(perm))
  } else {
    return true
  }
}

export const filterAsyncRoutes = (routes: RouteConfig[], perms: string[]) => {
  const res: RouteConfig[] = []
  routes.forEach(route => {
    const r = { ...route }
    // 子用户重构后注释掉原先逻辑，改为下面的代码
    // if (hasPermission(perms, r)) {
    //   if (r.children) {
    //     r.children = filterAsyncRoutes(r.children, perms)
    //   }
    //   res.push(r)
    // }
    if (r.children) {
      r.children = filterAsyncRoutes(r.children, perms)
      if (r.children && r.children.length > 0) {
        res.push(r)
      }
    } else {
      if (hasPermission(perms, r)) {
        res.push(r)
      }
    }
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
  public GenerateRoutes(perms: string[]) {
    let accessedRoutes
    if (perms.includes('*')) {
      accessedRoutes = asyncRoutes
    } else {
      accessedRoutes = filterAsyncRoutes(asyncRoutes, perms)
    }
    this.SET_ROUTES(accessedRoutes)
  }
}

export const PermissionModule = getModule(Permission)
