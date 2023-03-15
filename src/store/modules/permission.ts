/*
 * @Author: liugongjian liugongjianxin@163.com
 * @Date: 2023-03-06 15:17:33
 * @LastEditors: liugongjian liugongjianxin@163.com
 * @LastEditTime: 2023-03-13 17:02:20
 * @FilePath: \vss-user-web\src\store\modules\permission.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { asyncRoutes, constantRoutes } from '@/router'
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

const hasVersion: IMatchFn = (version, route) => {
  if (route.meta && route.meta.version) {
    return route.meta.version === version
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
export const filterAsyncRoutesByVersion = filterAsyncRoutes.bind(null, hasVersion)

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
  public GenerateRoutes(params: { tags: string[], perms: string[], iamUserId: string, version: number }) {
    let accessedRoutes
    let filteredRoutes = asyncRoutes
    console.log('asyncRoutes:', asyncRoutes)
    if (params.iamUserId) {
      filteredRoutes = filteredRoutes.filter(route => route.path !== '/access-manage')
    }

    // 根据route.meta.tags及用户tags过滤路由
    filteredRoutes = filterAsyncRoutesByTags(filteredRoutes, params.tags)

    // 根据route.meta.version及用户version过滤路由
    filteredRoutes = filterAsyncRoutesByVersion(filteredRoutes, params.version)

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
