import settings from '@/settings'
import Vue from 'vue'
import Router, { RouteConfig } from 'vue-router'
// import { deviceRouter, videoRouter, iboxRouter } from '@vss/device/router'
import { v1Router } from './modules/v1'
import { v2Router } from './modules/v2'

/* Layout */
import Layout from '@/layout/index.vue'

/* Router modules */

Vue.use(Router)

/*
  Note: sub-menu only appear when children.length>=1
  Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
*/

/*
  name:'router-name'             the name field is required when using <keep-alive>, it should also match its component's name property
                                 detail see : https://vuejs.org/v2/guide/components-dynamic-async.html#keep-alive-with-Dynamic-Components
  redirect:                      if set to 'noredirect', no redirect action will be trigger when clicking the breadcrumb
  meta: {
    roles: ['admin', 'editor']   will control the page roles (allow setting multiple roles)
    title: 'title'               the name showed in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon showed in the sidebar
    hidden: true                 if true, this route will not show in the sidebar (default is false)
    alwaysShow: true             if true, will always show the root menu (default is false)
                                 if false, hide the root menu when has less or equal than one children route
    breadcrumb: false            if false, the item will be hidden in breadcrumb (default is true)
    noCache: true                if true, the page will not be cached (default is false)
    affix: true                  if true, the tag will affix in the tags-view
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
*/

// 过滤掉重复路由产生的报错
const originalPush = Router.prototype.push

Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      throw err
    }
  })
}

/**
  ConstantRoutes
  a base page that does not have permission requirements
  all roles can be accessed
*/
export const constantRoutes: RouteConfig[] = [
  {
    path: '/redirect',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import(/* webpackChunkName: "common-page" */ '@/views/Redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/Login/index.vue'),
    meta: { hidden: true },
    children: [
      {
        path: 'subAccount',
        component: () => import(/* webpackChunkName: "login" */ '@/views/Login/index.vue')
      }
    ]
  },
  {
    path: '/reset-password',
    component: () => import(/* webpackChunkName: "common-page" */ '@/views/Login/ResetPassword.vue'),
    meta: { hidden: true }
  },
  {
    path: '/auth-redirect',
    component: () => import(/* webpackChunkName: "common-page" */ '@/views/Login/AuthRedirect.vue'),
    meta: { hidden: true }
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "common-page" */ '@/views/ErrorPage/404.vue'),
    meta: { hidden: true }
  },
  {
    path: '/401',
    component: () => import(/* webpackChunkName: "common-page" */ '@/views/ErrorPage/401.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      hidden: true
    }
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user perms
 */
export const asyncRoutes: RouteConfig[] = [
  ...v1Router,
  ...v2Router,
  {
    path: '*',
    redirect: '/404',
    meta: { hidden: true }
  }
]

const createRouter = () =>
  new Router({
    mode: 'history', // Disabled due to Github Pages doesn't support this, enable this if you need.
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) {
        return savedPosition
      } else {
        return { x: 0, y: 0 }
      }
    },
    base: settings.projectPrefix,
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  ;(router as any).matcher = (newRouter as any).matcher // reset router
}

export default router
