import Vue from 'vue'
import Router, { RouteConfig } from 'vue-router'
import settings from '@/settings'

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
      title: '概览',
      icon: 'dashboard',
      breadcrumb: false,
      perms: ['DescribeDashboard'],
      alwaysShow: false
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/index.vue'),
        name: 'dashboard',
        meta: {
          title: '概览',
          icon: 'dashboard',
          breadcrumb: true,
          perms: ['DescribeDashboard']
        }
      },
      {
        path: 'ai',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/ai/index.vue'),
        name: 'dashboardAI',
        meta: {
          title: 'AI监控告警',
          hidden: true,
          icon: 'dashboard',
          breadcrumb: false,
          perms: ['DescribeDashboard']
        }
      },
      {
        path: 'visualization-dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/VisualizationDashboard.vue'),
        name: 'visualizationDashboard',
        meta: {
          title: '可视化大屏',
          hidden: true,
          icon: 'dashboard',
          breadcrumb: false,
          perms: ['DescribeDashboard']
        }
      }
    ]
  },
  {
    path: '/group',
    component: Layout,
    meta: {
      title: '业务组管理',
      icon: 'tree',
      perms: ['DescribeGroup'],
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
          perms: ['DescribeGroup'],
          activeMenu: '/group'
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
          perms: ['AdminGroup'],
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
          perms: ['AdminGroup'],
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
          perms: ['DescribeGroup'],
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
      icon: 'component',
      perms: ['DescribeDevice'],
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
          title: '设备管理',
          icon: 'component',
          breadcrumb: false,
          perms: ['DescribeDevice'],
          groupSelector: true
        },
        children: [
          {
            path: '',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/List.vue'),
            name: 'device-list',
            meta: {
              title: '设备列表',
              breadcrumb: false,
              perms: ['DescribeDevice'],
              activeMenu: '/device',
              groupSelector: true
            }
          },
          {
            path: 'create',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/Create.vue'),
            name: 'device-create',
            meta: {
              title: '添加设备',
              hidden: true,
              perms: ['AdminDevice'],
              activeMenu: '/device',
              groupSelector: true
            }
          },
          {
            path: 'update',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/Create.vue'),
            name: 'device-update',
            meta: {
              title: '编辑设备',
              hidden: true,
              perms: ['AdminDevice'],
              activeMenu: '/device',
              groupSelector: true
            }
          },
          {
            path: 'detail',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/Detail.vue'),
            name: 'device-detail',
            meta: {
              title: '设备详情',
              hidden: true,
              perms: ['DescribeDevice'],
              activeMenu: '/device',
              groupSelector: true
            }
          },
          {
            path: 'config-channel',
            component: () => import(/* webpackChunkName: "device" */ '@/views/device/ConfigChannel.vue'),
            name: 'config-channel',
            meta: {
              title: '配置子通道',
              hidden: true,
              perms: ['AdminDevice'],
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
  //     perms: ['*'],
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
  //         perms: ['*'],
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
  //         perms: ['*'],
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
      title: '实时预览',
      icon: 'ipc',
      perms: ['ScreenPreview'],
      alwaysShow: false,
      groupSelector: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "screen" */ '@/views/device/Live.vue'),
        name: 'screen',
        meta: {
          title: '实时预览',
          icon: 'ipc',
          breadcrumb: false,
          perms: ['ScreenPreview'],
          activeMenu: '/screen',
          groupSelector: true
        }
      }
    ]
  },
  {
    path: '/player-debug',
    component: () => import(/* webpackChunkName: "debug" */ '@/components/VssPlayer/Debug.vue'),
    name: 'device-debug',
    meta: {
      title: '播放器调试',
      icon: 'stream',
      hidden: true,
      perms: ['*'],
      activeMenu: '/device'
    }
  },
  {
    path: '/replay-debug',
    component: () => import(/* webpackChunkName: "debug" */ '@/views/device/components/ReplayPlayer/Debug.vue'),
    name: 'replay-debug',
    meta: {
      title: '录像调试',
      icon: 'stream',
      hidden: true,
      perms: ['*'],
      activeMenu: '/device'
    }
  },
  {
    path: '/replay-debug2',
    component: () => import(/* webpackChunkName: "debug" */ '@/views/device/components/ReplayPlayer/Debug3.vue'),
    name: 'replay-debug2',
    meta: {
      title: '录像调试',
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
      title: '录像回放',
      icon: 'video',
      perms: ['ReplayRecord'],
      alwaysShow: false,
      groupSelector: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "replay" */ '@/views/device/Replay.vue'),
        name: 'replay',
        meta: {
          title: '录像回放',
          icon: 'video',
          breadcrumb: false,
          perms: ['ReplayRecord'],
          activeMenu: '/replay',
          groupSelector: true
        }
      }
    ]
  },

  {
    path: '/map',
    component: Layout,
    meta: {
      title: '电子地图',
      icon: 'mark',
      perms: ['DescribeMap'],
      tags: ['showDigitalMap'],
      alwaysShow: false,
      only: true,
      groupSelector: false
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "map" */ '@/views/map/index.vue'),
        name: 'map',
        meta: {
          title: '电子地图',
          icon: 'mark',
          breadcrumb: false,
          perms: ['DescribeMap']
        }
      }]
  },
  {
    path: '/up-platform',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '向上级联',
      icon: 'platform',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*']
    },
    children: [
      {
        path: 'gb28121',
        component: () => import(/* webpackChunkName: "up-platform" */ '@/views/upPlatform/index.vue'),
        name: 'up-platform',
        meta: {
          title: '国标级联',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/up-platform/gb28121'
        }
      },
      {
        path: 'gb28121-create',
        component: () => import(/* webpackChunkName: "up-platform" */ '@/views/upPlatform/create.vue'),
        name: 'up-platform-gb28121-create',
        meta: {
          title: '新建国标级联',
          hidden: true,
          perms: ['*'],
          activeMenu: '/up-platform/gb28121'
        }
      },
      {
        path: 'gb28121-update',
        component: () => import(/* webpackChunkName: "up-platform" */ '@/views/upPlatform/create.vue'),
        name: 'up-platform-gb28121-update',
        meta: {
          title: '编辑国标级联',
          hidden: true,
          perms: ['*'],
          activeMenu: '/up-platform/gb28121'
        }
      }
    ]
  },
  {
    path: '/view-service',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '视图服务',
      icon: 'viewLib',
      alwaysShow: true,
      // tags: ['ga1400'],
      perms: ['*']
    },
    children: [
      {
        path: 'up-platform',
        component: () => import(/* webpackChunkName: "device" */ '@/views/viewService/index.vue'),
        name: 'view-up-platform',
        meta: {
          title: '向上级联',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/view-service/up-platform'
        }
      },
      {
        path: 'up-platform/create',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/viewService/create.vue'),
        name: 'view-up-platform-create',
        meta: {
          title: '新建平台',
          hidden: true,
          perms: ['*'],
          activeMenu: '/view-service/up-platform'
        }
      },
      {
        path: 'up-platform/update/:id?',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/viewService/create.vue'),
        name: 'view-up-platform-update',
        meta: {
          title: '编辑平台',
          hidden: true,
          perms: ['*'],
          activeMenu: '/view-service/up-platform'
        }
      }
    ]
  },
  {
    path: '/certificate',
    component: Layout,
    name: 'certificate',
    redirect: 'noredirect',
    meta: {
      title: '凭证管理',
      icon: 'key',
      alwaysShow: true,
      perms: ['*']
    },
    children: [
      {
        path: 'gb28181',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/gb28181/index.vue'),
        name: 'gb28181',
        meta: {
          name: 'certificate',
          title: 'GB28181凭证',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/certificate/gb28181'
        }
      },
      {
        path: 'gb28181/create',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/gb28181/create.vue'),
        name: 'gb28181-create',
        meta: {
          title: '新建GB28181凭证',
          hidden: true,
          perms: ['*'],
          activeMenu: '/certificate/gb28181'
        }
      },
      {
        path: 'gb28181/update/:id?',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/gb28181/create.vue'),
        name: 'gb28181-update',
        meta: {
          title: '编辑GB28181凭证',
          hidden: true,
          perms: ['*'],
          activeMenu: '/certificate/gb28181'
        }
      },
      {
        path: 'ga1400',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/ga1400/index.vue'),
        name: 'ga1400',
        meta: {
          id: '20210424150201007004',
          name: 'certificate',
          title: 'GA1400凭证',
          icon: 'dot',
          perms: ['*'],
          // tags: ['ga1400'],
          activeMenu: '/certificate/ga1400'
        }
      },
      {
        path: 'ga1400/create',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/ga1400/create.vue'),
        name: 'ga1400-create',
        meta: {
          id: '20210424150201007005',
          title: '新建GA1400凭证',
          hidden: true,
          perms: ['*'],
          // tags: ['ga1400'],
          activeMenu: '/certificate/ga1400'
        }
      },
      {
        path: 'ga1400/update/:id?',
        component: () => import(/* webpackChunkName: "tree" */ '@/views/certificate/ga1400/create.vue'),
        name: 'ga1400-update',
        meta: {
          id: '20210424150201007006',
          title: '编辑GA1400凭证',
          hidden: true,
          perms: ['*'],
          // tags: ['ga1400'],
          activeMenu: '/certificate/ga1400'
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
          title: '录制模板',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/template/record'
        }
      },
      {
        path: 'record/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/record/createOrUpdate.vue'),
        name: 'record-create',
        meta: {
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
          title: '回调模板',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/template/callback'
        }
      },
      {
        path: 'callback/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/callback/createOrUpdate.vue'),
        name: 'callback-create',
        meta: {
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
          title: '编辑回调模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/callback'
        }
      },
      // {
      //   path: 'ai',
      //   component: () => import(/* webpackChunkName: "template" */ '@/views/template/ai/index.vue'),
      //   name: 'ai',
      //   meta: {
      //     title: 'AI模板',
      //     icon: 'dot',
      //     perms: ['*'],
      //     activeMenu: '/template/ai'
      //   }
      // },
      {
        path: 'ai/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/ai/createOrUpdate.vue'),
        name: 'ai-create',
        meta: {
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
          title: '编辑AI模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/ai'
        }
      },
      {
        path: 'alert',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/alert/index.vue'),
        name: 'alert',
        meta: {
          title: '告警模板',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/template/alert'
        }
      },
      {
        path: 'alert/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/alert/createOrUpdate.vue'),
        name: 'alert-create',
        meta: {
          title: '新建告警模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/alert'
        }
      },
      {
        path: 'alert/update/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/alert/createOrUpdate.vue'),
        name: 'alert-update',
        meta: {
          title: '编辑告警模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/alert'
        }
      },
      {
        path: 'alert/details/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/template/alert/details.vue'),
        name: 'alert-details',
        meta: {
          title: '模板详情',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/alert'
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
      title: '修改密码',
      icon: 'tree',
      hidden: true,
      breadcrumb: true
    },
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "changePassword" */ '@/views/changePassword/index.vue'),
        meta: {
          title: '修改密码',
          icon: 'tree',
          breadcrumb: false
        }
      }
    ]
  },
  {
    path: '/userConfiguration',
    component: Layout,
    meta: {
      title: '配置',
      icon: 'tree',
      hidden: true,
      breadcrumb: true,
      perms: ['*']
    },
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "userConfiguration" */ '@/views/userConfiguration/index.vue'),
        meta: {
          title: '配置',
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
    redirect: 'noredirect',
    name: 'ai',
    meta: {
      title: 'AI管理',
      icon: 'ai-face',
      alwaysShow: true,
      perms: ['DescribeAi']
    },
    children: [
      {
        path: 'maskRecognation',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/maskRecognation/index.vue'),
        name: 'AI-MaskRecognation',
        meta: {
          title: '口罩识别',
          icon: 'dot',
          hidden: true,
          breadcrumb: false,
          activeMenu: '/AI',
          perms: ['DescribeAi']
        }
      },
      {
        path: 'ai-app-list',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/applist/index.vue'),
        name: 'AI-AppList',
        meta: {
          title: 'AI应用',
          icon: 'dot',
          hidden: false,
          breadcrumb: true,
          only: true,
          activeMenu: '/AI/ai-app-list',
          perms: ['DescribeAi']
        }
      },
      {
        path: 'create',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/applist/AddApp.vue'),
        name: 'AI-AddApp',
        meta: {
          title: '添加应用',
          icon: 'dot',
          hidden: true,
          breadcrumb: true,
          activeMenu: '/AI/ai-app-list',
          perms: ['AdminAi']
        }
      },
      {
        path: 'edit',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/applist/AddApp.vue'),
        name: 'AI-EditApp',
        meta: {
          title: '编辑应用',
          icon: 'dot',
          hidden: true,
          breadcrumb: true,
          activeMenu: '/AI/ai-app-list',
          perms: ['AdminAi']
        }
      },
      {
        path: 'detail',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/applist/AppDetail.vue'),
        name: 'AI-AppDetail',
        meta: {
          title: '应用详情',
          icon: 'dot',
          hidden: true,
          breadcrumb: false,
          activeMenu: '/AI/ai-app-list',
          perms: ['DescribeAi']
        }
      },
      {
        path: 'config',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/aiconfig/index.vue'),
        name: 'aiconfig',
        meta: {
          title: '人脸库',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/AI/config',
          perms: ['AdminAi']
        }
      },
      {
        path: 'facelib',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/Face/index.vue'),
        name: 'facelib',
        meta: {
          title: '人脸库2',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/AI/face',
          perms: ['AdminAi']
        }
      },
      {
        path: 'facelib/detail',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/Face/Personal.vue'),
        name: 'personal',
        meta: {
          title: '人脸库详情',
          icon: 'dot',
          hidden: true,
          activeMenu: '/AI/personal',
          perms: ['AdminAi']
        }
      }
    ]
  },
  {
    path: '/accessManage',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '访问管理',
      icon: 'user',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*']
    },
    children: [
      {
        path: 'dashboard',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/user/Dashboard.vue'),
        name: 'accessManage-dashboard',
        meta: {
          title: '概览',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/accessManage/dashboard',
          perms: ['*']
        }
      },
      {
        path: 'user',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/user/index.vue'),
        name: 'accessManage-user',
        meta: {
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
          title: '创建用户',
          icon: 'dot',
          hidden: true,
          activeMenu: '/accessManage/user',
          perms: ['*']
        }
      },
      {
        path: 'user/detail',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/user/components/UserDetail.vue'),
        name: 'accessManage-user-detail',
        meta: {
          title: '成员详情',
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
          title: '创建策略',
          icon: 'dot',
          hidden: true,
          activeMenu: '/accessManage/policy',
          perms: ['*']
        }
      },
      {
        path: 'policy/edit/:id?',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/policy/components/CreatePolicy.vue'),
        name: 'accessManage-policy-edit',
        meta: {
          title: '查看&编辑策略',
          icon: 'dot',
          hidden: true,
          activeMenu: '/accessManage/policy',
          perms: ['*']
        }
      },
      {
        path: 'role',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/role/index.vue'),
        name: 'accessManage-role',
        meta: {
          title: '角色',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/accessManage/role',
          perms: ['*']
        }
      },
      {
        path: 'role/create',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/role/components/CreateRole.vue'),
        name: 'accessManage-role-create',
        meta: {
          title: '创建角色',
          icon: 'dot',
          hidden: true,
          activeMenu: '/accessManage/role',
          perms: ['*']
        }
      },
      {
        path: 'secretManage',
        component: () => import(/* webpackChunkName: "accessManage" */ '@/views/accessManage/secretManage/index.vue'),
        name: 'accessManage-secretManage',
        meta: {
          title: 'API密钥',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/accessManage/secretManage',
          perms: ['*']
        }
      }
    ]
  },
  {
    path: '/notification',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '消息推送',
      icon: 'notify',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*']
    },
    children: [
      {
        path: 'history',
        component: () => import(/* webpackChunkName: "notification" */ '@/views/notification/history/index.vue'),
        name: 'notification-history',
        meta: {
          title: '推送历史',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/notification/history',
          perms: ['*']
        }
      },
      {
        path: 'policy',
        component: () => import(/* webpackChunkName: "notification" */ '@/views/notification/policy/index.vue'),
        name: 'notification-policy',
        meta: {
          title: '推送策略',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/notification/policy',
          perms: ['*']
        }
      },
      {
        path: 'policy/create',
        component: () => import(/* webpackChunkName: "notification" */ '@/views/notification/policy/createOrUpdate.vue'),
        name: 'notification-policy-create',
        meta: {
          title: '创建推送策略',
          icon: 'dot',
          hidden: true,
          activeMenu: '/notification/policy',
          perms: ['*']
        }
      },
      {
        path: 'policy/edit/:id?',
        component: () => import(/* webpackChunkName: "notification" */ '@/views/notification/policy/createOrUpdate.vue'),
        name: 'notification-policy-edit',
        meta: {
          title: '编辑推送策略',
          icon: 'dot',
          hidden: true,
          activeMenu: '/notification/policy',
          perms: ['*']
        }
      }
    ]
  },
  {
    path: '/alarm',
    component: Layout,
    meta: {
      title: '告警管理',
      icon: 'alarm',
      perms: ['*'],
      alwaysShow: false,
      only: true,
      groupSelector: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "alarm" */ '@/views/alarm/index.vue'),
        name: 'alarm',
        meta: {
          title: '告警管理',
          icon: 'alarm',
          breadcrumb: false,
          perms: ['*'],
          groupSelector: true
        },
        children: [
          {
            path: '',
            component: () => import(/* webpackChunkName: "alarm" */ '@/views/alarm/list.vue'),
            name: 'alarm-list',
            meta: {
              title: '告警信息列表',
              breadcrumb: false,
              perms: ['*'],
              activeMenu: '/alarm',
              groupSelector: true
            }
          }
        ]
      }
    ]
  },
  {
    path: '/car',
    component: Layout,
    meta: {
      id: '20210515200901013321',
      title: '车辆管理',
      breadcrumb: true,
      icon: 'car',
      perms: ['AdminCar']
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "car" */ '@/views/car/index.vue'),
        name: 'car',
        meta: {
          id: '20210515200901013321',
          title: '车辆管理',
          breadcrumb: false,
          icon: 'car',
          perms: ['AdminCar']
        }
      }
    ]
  },
  {
    path: '/billing',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '计费管理',
      icon: 'billing',
      alwaysShow: true,
      perms: ['*']
    },
    children: [
      {
        path: 'resource',
        component: () => import(/* webpackChunkName: "billing" */ '@/views/billing/resource/index.vue'),
        name: 'billing-resource',
        meta: {
          title: '资源包管理',
          icon: 'dot',
          perms: ['*']
        }
      },
      {
        path: 'resource/management',
        component: () => import(/* webpackChunkName: "billing" */ '@/views/billing/resource/manage.vue'),
        name: 'billing-resource-management',
        meta: {
          title: '资源包管理',
          icon: 'dot',
          hidden: true,
          activeMenu: '/billing/resource',
          perms: ['*']
        }
      }
    ]
  },
  {
    path: '/exportDevices',
    component: Layout,
    meta: {
      title: '批量导出设备信息',
      icon: 'download',
      alwaysShow: false,
      perms: ['*'],
      tags: ['isLianZhouEdu']
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "exportDevices" */ '@/views/exportDevices/index.vue'),
        name: 'exportDevices',
        meta: {
          title: '批量导出设备信息',
          icon: 'download',
          breadcrumb: false,
          perms: ['*'],
          activeMenu: '/exportDevices'
        }
      }
    ]
  },
  {
    path: '/sysconfig',
    component: Layout,
    meta: {
      title: '系统设置',
      breadcrumb: true,
      icon: 'config',
      perms: ['*']
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "exportDevices" */ '@/views/sysconfig/index.vue'),
        name: 'exportDevices',
        meta: {
          title: '系统设置',
          breadcrumb: false,
          icon: 'config',
          perms: ['*']
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
  const newRouter = createRouter();
  (router as any).matcher = (newRouter as any).matcher // reset router
}

export default router
