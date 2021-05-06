import Vue from 'vue'
import Router, { RouteConfig } from 'vue-router'

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
    meta: { hidden: true },
    children: [
      {
        path: 'subAccount',
        component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue')
      }
    ]
  },
  {
    path: '/reset-password',
    component: () => import(/* webpackChunkName: "reset-password" */ '@/views/login/resetPassword.vue'),
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
    redirect: '/dashboard',
    meta: {
      id: '20210424151500000000',
      hidden: true
    }
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user perms
*/
export const asyncRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: Layout,
    meta: {
      id: '20210424150201001000',
      title: '首页',
      icon: 'dashboard',
      breadcrumb: false,
      perms: ['GET'],
      alwaysShow: false
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/index.vue'),
        name: 'dashboard',
        meta: {
          id: '20210424150201001001',
          title: '首页',
          icon: 'dashboard',
          breadcrumb: false
        }
      },
      {
        path: 'ai',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/ai/index.vue'),
        name: 'dashboardAI',
        meta: {
          id: '20210424150201001002',
          title: 'AI监控告警',
          hidden: true,
          icon: 'dashboard',
          breadcrumb: false
        }
      }
    ]
  },
  {
    path: '/group',
    component: Layout,
    meta: {
      id: '20210424150201002000',
      title: '业务组管理',
      icon: 'tree',
      perms: ['GET'],
      alwaysShow: false
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "group" */ '@/views/group/index.vue'),
        name: 'group-list',
        meta: {
          id: '20210424150201002001',
          title: '业务组管理',
          icon: 'tree',
          breadcrumb: false,
          perms: ['GET']
        }
      },
      {
        path: 'create',
        component: () => import(/* webpackChunkName: "group" */ '@/views/group/create.vue'),
        name: 'group-create',
        meta: {
          id: '20210424150201002002',
          title: '新建业务组',
          icon: 'tree',
          hidden: true,
          perms: ['*'],
          activeMenu: '/group'
        }
      },
      {
        path: 'update',
        component: () => import(/* webpackChunkName: "group" */ '@/views/group/create.vue'),
        name: 'group-update',
        meta: {
          id: '20210424150201002003',
          title: '编辑业务组',
          icon: 'tree',
          hidden: true,
          perms: ['*'],
          activeMenu: '/group'
        }
      },
      {
        path: 'config',
        component: () => import(/* webpackChunkName: "group" */ '@/views/group/config.vue'),
        name: 'group-config',
        meta: {
          id: '20210424150201002004',
          title: '业务组配置',
          icon: 'tree',
          hidden: true,
          perms: ['GET'],
          activeMenu: '/group'
        }
      }
    ]
  },
  {
    path: '/device',
    component: Layout,
    meta: {
      id: '20210424150201003000',
      title: '设备管理',
      icon: 'component',
      perms: ['GET'],
      alwaysShow: false,
      only: true,
      groupSelector: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "device" */ '@/views/device/index.vue'),
        name: 'device',
        meta: {
          id: '20210424150201003001',
          title: '设备管理',
          icon: 'component',
          breadcrumb: false,
          perms: ['GET'],
          groupSelector: true
        },
        children: [
          {
            path: '',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/list.vue'),
            name: 'device-list',
            meta: {
              id: '20210424150201003002',
              title: '设备列表',
              breadcrumb: false,
              perms: ['GET'],
              activeMenu: '/device',
              groupSelector: true
            }
          },
          {
            path: 'create',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/create.vue'),
            name: 'device-create',
            meta: {
              id: '20210424150201003003',
              title: '添加设备',
              hidden: true,
              perms: ['*'],
              activeMenu: '/device',
              groupSelector: true
            }
          },
          {
            path: 'update',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/create.vue'),
            name: 'device-update',
            meta: {
              id: '20210424150201003004',
              title: '编辑设备',
              hidden: true,
              perms: ['*'],
              activeMenu: '/device',
              groupSelector: true
            }
          },
          {
            path: 'detail',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/detail.vue'),
            name: 'device-detail',
            meta: {
              id: '20210424150201003005',
              title: '设备详情',
              hidden: true,
              perms: ['GET'],
              activeMenu: '/device',
              groupSelector: true
            }
          },
          {
            path: 'preview/:tab?',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/preview.vue'),
            name: 'device-preview',
            meta: {
              id: '20210424150201003006',
              title: '监控查看',
              hidden: true,
              perms: ['GET'],
              activeMenu: '/device',
              groupSelector: true
            }
          }
        ]
      }
    ]
  },

  // {
  //   path: '/stream',
  //   component: Layout,
  //   meta: {
  //     title: '流管理',
  //     icon: 'stream',
  //     perms: ['GET'],
  //     alwaysShow: false,
  //     only: true,
  //     groupSelector: true
  //   },
  //   children: [
  //     {
  //       path: '',
  //       component: () => import(/* webpackChunkName: "stream" */ '@/views/stream/index.vue'),
  //       name: 'stream',
  //       meta: {
  //         title: '流管理',
  //         icon: 'stream',
  //         breadcrumb: false,
  //         perms: ['GET'],
  //         activeMenu: '/stream',
  //         groupSelector: true
  //       }
  //     },
  //     {
  //       path: 'info',
  //       component: () => import(/* webpackChunkName: "stream" */ '@/views/stream/info.vue'),
  //       name: 'stream-config',
  //       meta: {
  //         title: '流详情',
  //         icon: 'stream',
  //         hidden: true,
  //         perms: ['GET'],
  //         activeMenu: '/stream',
  //         groupSelector: true
  //       }
  //     },
  //     {
  //       path: 'create',
  //       component: () => import(/* webpackChunkName: "stream" */ '@/views/stream/create.vue'),
  //       name: 'stream-create',
  //       meta: {
  //         title: '创建流',
  //         icon: 'stream',
  //         hidden: true,
  //         perms: ['*'],
  //         activeMenu: '/stream',
  //         groupSelector: true
  //       }
  //     },
  //     {
  //       path: 'preview',
  //       component: () => import(/* webpackChunkName: "stream" */ '@/views/stream/preview.vue'),
  //       name: 'stream-preview',
  //       meta: {
  //         title: '实时预览',
  //         icon: 'tree',
  //         hidden: true,
  //         perms: ['*'],
  //         activeMenu: '/stream',
  //         groupSelector: true
  //       }
  //     }
  //   ]
  // },
  {
    path: '/screen',
    component: Layout,
    meta: {
      id: '20210424150201004000',
      title: '实时预览',
      icon: 'ipc',
      perms: ['GET'],
      alwaysShow: false,
      groupSelector: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "screen" */ '@/views/device/screen.vue'),
        name: 'screen',
        meta: {
          id: '20210424150201004001',
          title: '实时预览',
          icon: 'ipc',
          breadcrumb: false,
          perms: ['GET'],
          activeMenu: '/screen',
          groupSelector: true
        }
      }
    ]
  },
  {
    path: '/player-debug',
    component: () => import(/* webpackChunkName: "device" */ '@/views/device/debug.vue'),
    name: 'device-debug',
    meta: {
      id: '20210424150201005000',
      title: '播放器调试',
      icon: 'stream',
      hidden: true,
      perms: ['*'],
      activeMenu: '/device'
    }
  },
  {
    path: '/replay',
    component: Layout,
    meta: {
      id: '20210424150201006000',
      title: '录像回放',
      icon: 'video',
      perms: ['GET'],
      alwaysShow: false,
      groupSelector: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "replay" */ '@/views/device/replay.vue'),
        name: 'replay',
        meta: {
          id: '20210424150201006001',
          title: '录像回放',
          icon: 'video',
          breadcrumb: false,
          perms: ['GET'],
          activeMenu: '/replay',
          groupSelector: true
        }
      }
    ]
  },
  {
    path: '/certificate',
    component: Layout,
    meta: {
      id: '20210424150201007000',
      title: '凭证管理',
      icon: 'key',
      alwaysShow: true,
      breadcrumb: false,
      perms: ['*']
    },
    children: [
      {
        path: 'gb28181',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/gb28181/index.vue'),
        name: 'gb28181',
        meta: {
          id: '20210424150201007001',
          name: 'certificate',
          title: 'GB28181凭证',
          icon: 'dot',
          perms: ['*']
        }
      },
      {
        path: 'gb28181/create',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/gb28181/create.vue'),
        name: 'gb28181-create',
        meta: {
          id: '20210424150201007002',
          title: '新建GB28181凭证',
          hidden: true,
          perms: ['*']
        }
      },
      {
        path: 'gb28181/update/:id?',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/gb28181/create.vue'),
        name: 'gb28181-update',
        meta: {
          id: '20210424150201007003',
          title: '编辑GB28181凭证',
          hidden: true,
          perms: ['*']
        }
      }
    ]
  },
  {
    path: '/template',
    component: Layout,
    redirect: 'noredirect',
    name: 'template',
    meta: {
      id: '20210424150201008000',
      title: '模板管理',
      icon: 'template',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*']
    },
    children: [
      {
        path: 'record',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/record/index.vue'),
        name: 'record',
        meta: {
          id: '20210424150201008001',
          title: '录制模板',
          icon: 'dot',
          perms: ['*']
        }
      },
      {
        path: 'record/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/record/createOrUpdate.vue'),
        name: 'record-create',
        meta: {
          id: '20210424150201008002',
          title: '新建录制模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/record'
        }
      },
      {
        path: 'record/update/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/record/createOrUpdate.vue'),
        name: 'record-update',
        meta: {
          id: '20210424150201008003',
          title: '编辑录制模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/record'
        }
      },
      {
        path: 'callback',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/callback/index.vue'),
        name: 'callback',
        meta: {
          id: '20210424150201008004',
          title: '回调模板',
          icon: 'dot',
          perms: ['*']
        }
      },
      {
        path: 'callback/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/callback/createOrUpdate.vue'),
        name: 'callback-create',
        meta: {
          id: '20210424150201008005',
          title: '新建回调模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/callback'
        }
      },
      {
        path: 'callback/update/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/callback/createOrUpdate.vue'),
        name: 'callback-update',
        meta: {
          id: '20210424150201008006',
          title: '编辑回调模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/callback'
        }
      },
      {
        path: 'ai',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/ai/index.vue'),
        name: 'ai',
        meta: {
          id: '20210424150201008007',
          title: 'AI模板',
          icon: 'dot',
          perms: ['*']
        }
      },
      {
        path: 'ai/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/ai/createOrUpdate.vue'),
        name: 'ai-create',
        meta: {
          id: '20210424150201008008',
          title: '新建AI模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/ai'
        }
      },
      {
        path: 'ai/update/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/ai/createOrUpdate.vue'),
        name: 'ai-update',
        meta: {
          id: '20210424150201008009',
          title: '编辑AI模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/ai'
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
      //     perms: ['*']
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
      //     perms: ['*'],
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
      //     perms: ['*'],
      //     activeMenu: '/template/snapshot'
      //   }
      // }
    ]
  },
  {
    path: '/changePassword',
    component: Layout,
    meta: {
      id: '20210424150201009000',
      title: '修改密码',
      icon: 'tree',
      hidden: true,
      breadcrumb: true,
      perms: ['*']
    },
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "changePassword" */ '@/views/changePassword/index.vue'),
        meta: {
          id: '20210424150201009001',
          title: '修改密码',
          icon: 'tree',
          breadcrumb: false,
          perms: ['*']
        }
      }
    ]
  },
  {
    path: '/AI',
    component: Layout,
    redirect: '/AI/config',
    name: 'ai',
    meta: {
      id: '20210424150201010000',
      title: 'AI配置',
      icon: 'key',
      alwaysShow: true,
      breadcrumb: false,
      perms: ['*']
    },
    children: [
      {
        path: 'config',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/aiconfig/index.vue'),
        name: 'aiconfig',
        meta: {
          id: '20210424150201010001',
          title: '人脸库',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/AI/config',
          perms: ['*']
        }
      },
      {
        path: 'maskRecognation',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/maskRecognation/index.vue'),
        name: 'AI-MaskRecognation',
        meta: {
          id: '20210424150201010002',
          title: '口罩识别',
          icon: 'dot',
          hidden: true,
          breadcrumb: false,
          activeMenu: '/AI',
          perms: ['*']
        }
      }
    ]
  },
  {
    path: '/accessManage',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      id: '20210424150201011000',
      title: '访问管理',
      icon: 'user',
      alwaysShow: true,
      breadcrumb: false,
      perms: ['*']
    },
    children: [
      {
        path: 'user',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/user/index.vue'),
        name: 'accessManage-user',
        meta: {
          id: '20210424150201011001',
          title: '用户',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/accessManage/user',
          perms: ['*']
        }
      },
      {
        path: 'user/create',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/user/components/CreateUser.vue'),
        name: 'accessManage-user-create',
        meta: {
          id: '20210424150201011002',
          title: '创建用户',
          icon: 'dot',
          hidden: true,
          activeMenu: '/accessManage/user',
          perms: ['*']
        }
      },
      {
        path: 'policy',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/policy/index.vue'),
        name: 'accessManage-policy',
        meta: {
          id: '20210424150201011003',
          title: '策略',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/accessManage/policy',
          perms: ['*']
        }
      },
      {
        path: 'policy/create',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/policy/components/CreatePolicy.vue'),
        name: 'accessManage-policy-create',
        meta: {
          id: '20210424150201011004',
          title: '创建策略',
          icon: 'dot',
          hidden: true,
          activeMenu: '/accessManage/policy',
          perms: ['*']
        }
      },
      {
        path: 'policy/view',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/policy/components/ViewPolicy.vue'),
        name: 'accessManage-policy-view',
        meta: {
          id: '20210424150201011005',
          title: '策略详情',
          icon: 'dot',
          hidden: true,
          activeMenu: '/accessManage/policy',
          perms: ['*']
        }
      },
      {
        path: 'secretManage',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/secretManage/index.vue'),
        name: 'accessManage-secretManage',
        meta: {
          id: '20210424150201011006',
          title: 'API密钥',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/accessManage/secretManage',
          perms: ['*']
        }
      }
      // {
      //   path: 'role',
      //   component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/role/index.vue'),
      //   name: 'accessManage-role',
      //   meta: {
      //     title: '角色',
      //     icon: 'dot',
      //     breadcrumb: true,
      //     activeMenu: '/accessManage',
      //     perms: ['*']
      //   }
      // },
      // {
      //   path: 'role/create',
      //   component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/role/components/CreateRole.vue'),
      //   name: 'accessManage-role-create',
      //   meta: {
      //     title: '创建角色',
      //     icon: 'dot',
      //     hidden: true,
      //     activeMenu: '/accessManage',
      //     perms: ['*']
      //   }
      // }
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
