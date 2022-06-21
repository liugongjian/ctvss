import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { RouteConfig } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router'
import store from '@/store'
import { getLocalStorage } from '@/utils/storage'
import casService from '@/services/casService'

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

    // 根据route.meta.tags及用户tags过滤路由
    const tags = store.state.user.tags || ({})
    const userTagList = Object.keys(tags).filter(key => tags[key] === 'Y')
    filteredRoutes = filteredRoutes.filter(route => !route.meta.tags || route.meta.tags.every(neededTag => userTagList.indexOf(neededTag) !== -1))

    if (params.perms.includes('*')) {
      accessedRoutes = filteredRoutes
    } else {
      accessedRoutes = filterAsyncRoutes(filteredRoutes, params.perms)
    }
    this.SET_ROUTES(accessedRoutes)
    if (getLocalStorage('casLoginId')) {
      casService.renderCasMenu(this.routes)
    }
  }
}

export const PermissionModule = getModule(Permission)
