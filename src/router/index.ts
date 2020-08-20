import Vue from 'vue'
import Router, { RouteConfig } from 'vue-router'

/* Layout */
import Layout from '@/layout/index.vue'

/* Router modules */
import chartsRouter from './modules/charts'

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
        component: () => import(/* webpackChunkName: "redirect" */ '@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
    meta: { hidden: true }
  },
  {
    path: '/auth-redirect',
    component: () => import(/* webpackChunkName: "auth-redirect" */ '@/views/login/auth-redirect.vue'),
    meta: { hidden: true }
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "404" */ '@/views/error-page/404.vue'),
    meta: { hidden: true }
  },
  {
    path: '/401',
    component: () => import(/* webpackChunkName: "401" */ '@/views/error-page/401.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/group'
  }
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/dashboard',
  //   children: [
  //     {
  //       path: 'dashboard',
  //       component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/index.vue'),
  //       name: 'Dashboard',
  //       meta: {
  //         title: '全局概览',
  //         icon: 'dashboard',
  //         affix: true
  //       }
  //     }
  //   ]
  // }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
*/
export const asyncRoutes: RouteConfig[] = [
  {
    path: '/group',
    component: Layout,
    meta: {
      title: '业务组管理',
      icon: 'tree',
      roles: ['admin'],
      alwaysShow: false
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "group" */ '@/views/group/index.vue'),
        name: 'group-list',
        meta: {
          title: '业务组管理',
          icon: 'tree',
          breadcrumb: false,
          roles: ['admin']
        }
      },
      {
        path: 'create',
        component: () => import(/* webpackChunkName: "group" */ '@/views/group/create.vue'),
        name: 'group-create',
        meta: {
          title: '新建业务组',
          icon: 'tree',
          hidden: true,
          roles: ['admin'],
          activeMenu: '/group'
        }
      },
      {
        path: 'update',
        component: () => import(/* webpackChunkName: "group" */ '@/views/group/create.vue'),
        name: 'group-update',
        meta: {
          title: '编辑业务组',
          icon: 'tree',
          hidden: true,
          roles: ['admin'],
          activeMenu: '/group'
        }
      },
      {
        path: 'config',
        component: () => import(/* webpackChunkName: "group" */ '@/views/group/config.vue'),
        name: 'group-config',
        meta: {
          title: '业务组配置',
          icon: 'tree',
          hidden: true,
          roles: ['admin'],
          activeMenu: '/group'
        }
      }
    ]
  },
  {
    path: '/device',
    component: Layout,
    meta: {
      title: '设备管理',
      icon: 'stream',
      roles: ['admin'],
      alwaysShow: false,
      only: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "device" */ '@/views/device/index.vue'),
        meta: {
          title: '设备管理',
          icon: 'stream',
          breadcrumb: false,
          roles: ['admin']
        },
        children: [
          {
            path: '',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/list.vue'),
            name: 'device-list',
            meta: {
              title: '设备列表',
              icon: 'stream',
              breadcrumb: false,
              roles: ['admin'],
              activeMenu: '/device'
            }
          },
          {
            path: 'create',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/create.vue'),
            name: 'device-create',
            meta: {
              title: '添加设备',
              icon: 'stream',
              hidden: true,
              roles: ['admin'],
              activeMenu: '/device'
            }
          },
          {
            path: 'update',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/create.vue'),
            name: 'device-update',
            meta: {
              title: '编辑设备',
              icon: 'tree',
              hidden: true,
              roles: ['admin'],
              activeMenu: '/device'
            }
          },
          {
            path: 'detail',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/detail.vue'),
            name: 'device-detail',
            meta: {
              title: '设备详情',
              icon: 'stream',
              hidden: true,
              roles: ['admin'],
              activeMenu: '/device'
            }
          },
          {
            path: 'preview/:tab?',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/preview.vue'),
            name: 'device-preview',
            meta: {
              title: '监控查看',
              icon: 'stream',
              hidden: true,
              roles: ['admin'],
              activeMenu: '/device'
            }
          }
        ]
      }
    ]
  },
  {
    path: '/screen',
    component: Layout,
    meta: {
      title: '实时预览',
      icon: 'tree',
      roles: ['admin'],
      alwaysShow: false
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "screen" */ '@/views/device/screen.vue'),
        name: 'screen',
        meta: {
          title: '实时预览',
          icon: 'stream',
          breadcrumb: false,
          roles: ['admin'],
          activeMenu: '/screen'
        }
      }
    ]
  },
  {
    path: '/replay',
    component: Layout,
    meta: {
      title: '录像回放',
      icon: 'tree',
      roles: ['admin'],
      alwaysShow: false
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "replay" */ '@/views/device/replay.vue'),
        name: 'replay',
        meta: {
          title: '录像回放',
          icon: 'stream',
          breadcrumb: false,
          roles: ['admin'],
          activeMenu: '/replay'
        }
      }
    ]
  },
  {
    path: '/certificate',
    component: Layout,
    meta: {
      title: '凭证管理',
      icon: 'tree',
      alwaysShow: true,
      breadcrumb: false,
      roles: ['admin']
    },
    children: [
      {
        path: 'gb28181',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/gb28181/index.vue'),
        name: 'gb28181',
        meta: {
          title: 'GB28181凭证',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'gb28181/create',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/gb28181/create.vue'),
        name: 'gb28181-create',
        meta: {
          title: '新建GB28181凭证',
          icon: 'stream',
          hidden: true,
          roles: ['admin']
        }
      },
      {
        path: 'gb28181/update/:id?',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/gb28181/create.vue'),
        name: 'gb28181-update',
        meta: {
          title: '编辑GB28181凭证',
          icon: 'stream',
          hidden: true,
          roles: ['admin']
        }
      }
    ]
  },
  {
    path: '/template',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '模板管理',
      icon: 'tree',
      alwaysShow: true,
      breadcrumb: true,
      roles: ['admin']
    },
    children: [
      {
        path: 'record',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/record/index.vue'),
        name: 'record',
        meta: {
          title: '录制模板',
          icon: 'tree',
          roles: ['admin']
        }
      },
      {
        path: 'record/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/record/createOrUpdate.vue'),
        name: 'record-create',
        meta: {
          title: '新建录制模板',
          icon: 'stream',
          hidden: true,
          roles: ['admin'],
          activeMenu: '/template/record'
        }
      },
      {
        path: 'record/update/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/record/createOrUpdate.vue'),
        name: 'record-update',
        meta: {
          title: '编辑录制模板',
          icon: 'stream',
          hidden: true,
          roles: ['admin'],
          activeMenu: '/template/record'
        }
      }
      // ,
      // {
      //   path: 'snapshot',
      //   component: () => import(/* webpackChunkName: "template" */ '@/views/template/snapshot/index.vue'),
      //   name: 'snapshot',
      //   meta: {
      //     title: '截图模板',
      //     icon: 'tree',
      //     roles: ['admin']
      //   }
      // },
      // {
      //   path: 'snapshot/create',
      //   component: () => import(/* webpackChunkName: "template" */ '@/views/template/snapshot/createOrUpdate.vue'),
      //   name: 'snapshot-create',
      //   meta: {
      //     title: '新建截图模板',
      //     icon: 'stream',
      //     hidden: true,
      //     roles: ['admin'],
      //     activeMenu: '/template/snapshot'
      //   }
      // },
      // {
      //   path: 'snapshot/update/:id?',
      //   component: () => import(/* webpackChunkName: "template" */ '@/views/template/snapshot/createOrUpdate.vue'),
      //   name: 'snapshot-update',
      //   meta: {
      //     title: '编辑截图模板',
      //     icon: 'stream',
      //     hidden: true,
      //     roles: ['admin'],
      //     activeMenu: '/template/snapshot'
      //   }
      // }
    ]
  },
  {
    path: '/secretManage',
    component: Layout,
    meta: {
      title: 'API密钥管理',
      icon: 'tree',
      hidden: true,
      breadcrumb: true,
      roles: ['admin']
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "secretManage" */ '@/views/secretManage/index.vue'),
        meta: {
          title: 'API密钥管理',
          icon: 'tree',
          breadcrumb: false,
          roles: ['admin']
        }
      }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    meta: { hidden: true }
  }
]

const createRouter = () => new Router({
  // mode: 'history',  // Disabled due to Github Pages doesn't support this, enable this if you need.
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  base: process.env.BASE_URL,
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  (router as any).matcher = (newRouter as any).matcher // reset router
}

export default router
