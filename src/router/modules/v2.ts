import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'
import { deviceRouter, videoRouter } from '@vss/device/router'

const upPlatformRouter: RouteConfig[] = [
  {
    path: 'up-platform',
    component: () => import(/* webpackChunkName: "device" */ '@/views/upPlatform/index.vue'),
    name: 'VideoUpPlatform',
    meta: {
      title: '向上级联',
      icon: 'dot',
      perms: ['*'],
      activeMenu: '/video/up-platform'
    }
  },
  {
    path: 'up-platform/create',
    component: () => import(/* webpackChunkName: "device" */ '@/views/upPlatform/create.vue'),
    name: 'VideoUpPlatformCreate',
    meta: {
      title: '新建国标级联',
      hidden: true,
      perms: ['*'],
      activeMenu: '/video/up-platform'
    }
  },
  {
    path: 'up-platform/update',
    component: () => import(/* webpackChunkName: "device" */ '@/views/upPlatform/create.vue'),
    name: 'VideoUpPlatformUpdate',
    meta: {
      title: '编辑国标级联',
      hidden: true,
      perms: ['*'],
      activeMenu: '/video/up-platform'
    }
  }
]

const vssVideoRouter = videoRouter
vssVideoRouter.children = videoRouter.children.concat(upPlatformRouter)

export const v2Router: RouteConfig[] = [
  {
    path: '/dashboard',
    component: Layout,
    meta: {
      title: '概览',
      icon: 'menu-dashboard',
      breadcrumb: false,
      perms: ['ivs:GetDashboard'],
      alwaysShow: false,
      version: 2
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard/index.vue'),
        name: 'Dashboard',
        meta: {
          title: '概览',
          icon: 'menu-dashboard',
          breadcrumb: true,
          perms: ['ivs:GetDashboard']
        }
      },
      {
        path: 'ai',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard/AI/index.vue'),
        name: 'DashboardAI',
        meta: {
          title: 'AI监控告警',
          hidden: true,
          icon: 'menu-dashboard',
          breadcrumb: false,
          perms: ['ivs:GetDashboard']
        }
      },
      {
        path: 'visualization-dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard/VisualizationDashboard.vue'),
        name: 'VisualizationDashboard',
        meta: {
          title: '可视化大屏',
          hidden: true,
          icon: 'menu-dashboard',
          breadcrumb: false,
          perms: ['ivs:GetDashboard']
        }
      }
    ]
  },
  deviceRouter,
  vssVideoRouter,
  {
    path: '/viid',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '视图服务',
      icon: 'menu-ga1400',
      alwaysShow: true,
      version: 2,
      perms: ['*']
    },
    children: [
      {
        path: 'up-platform',
        component: () => import(/* webpackChunkName: "viid" */ '@/views/VIID/index.vue'),
        name: 'ViidUpPlatform',
        meta: {
          title: '向上级联',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/viid/up-platform'
        }
      },
      {
        path: 'up-platform/create',
        component: () => import(/* webpackChunkName: "viid" */ '@/views/VIID/Create.vue'),
        name: 'ViidUpPlatformCreate',
        meta: {
          title: '新建平台',
          hidden: true,
          perms: ['*'],
          activeMenu: '/viid/up-platform'
        }
      },
      {
        path: 'up-platform/update/:id?',
        component: () => import(/* webpackChunkName: "viid" */ '@/views/VIID/Create.vue'),
        name: 'ViidUpPlatformUpdate',
        meta: {
          title: '编辑平台',
          hidden: true,
          perms: ['*'],
          activeMenu: '/viid/up-platform'
        }
      },
      // {
      //   path: 'subscribe',
      //   component: () => import(/* webpackChunkName: "viid" */ '@/views/VIID/Subscribe/index.vue'),
      //   name: 'ViidSubscribe',
      //   meta: {
      //     title: '订阅通知',
      //     icon: 'dot',
      //     perms: ['*'],
      //     activeMenu: '/viid/subscribe'
      //   }
      // },
      {
        path: 'subscribe/create',
        component: () => import(/* webpackChunkName: "viid" */ '@/views/VIID/Subscribe/components/Create.vue'),
        name: 'ViidSubscribeCreate',
        meta: {
          title: '添加订阅',
          hidden: true,
          perms: ['*'],
          activeMenu: '/viid/subscribe'
        }
      },
      {
        path: 'subscribe/cancel',
        component: () => import(/* webpackChunkName: "viid" */ '@/views/VIID/Subscribe/components/Cancel.vue'),
        name: 'ViidSubscribeCancel',
        meta: {
          title: '取消订阅',
          hidden: true,
          perms: ['*'],
          activeMenu: '/viid/subscribe'
        }
      }
    ]
  },
  {
    path: '/map',
    component: Layout,
    meta: {
      title: '电子地图',
      icon: 'menu-map',
      perms: ['ivs:GetMap'],
      alwaysShow: false,
      only: true,
      groupSelector: false,
      version: 2
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "map" */ '@/views/Map/index.vue'),
        name: 'map',
        meta: {
          title: '电子地图',
          icon: 'menu-map',
          breadcrumb: false,
          perms: ['ivs:GetMap'],
          activeMenu: '/map'
        }
      }
    ]
  },
  // {
  //   path: '/up-platform',
  //   component: Layout,
  //   redirect: 'noredirect',
  //   meta: {
  //     title: '向上级联',
  //     icon: 'menu-up-platform',
  //     alwaysShow: true,
  //     breadcrumb: true,
  //     perms: ['*'],
  //     version: 2
  //   },
  //   children: [
  //     {
  //       path: 'gb28121',
  //       component: () => import(/* webpackChunkName: "up-platform" */ '@/views/upPlatform/index.vue'),
  //       name: 'up-platform',
  //       meta: {
  //         title: '国标级联',
  //         icon: 'dot',
  //         perms: ['*'],
  //         activeMenu: '/up-platform/gb28121'
  //       }
  //     },
  //     {
  //       path: 'gb28121-create',
  //       component: () => import(/* webpackChunkName: "up-platform" */ '@/views/upPlatform/create.vue'),
  //       name: 'up-platform-gb28121-create',
  //       meta: {
  //         title: '新建国标级联',
  //         hidden: true,
  //         perms: ['*'],
  //         activeMenu: '/up-platform/gb28121'
  //       }
  //     },
  //     {
  //       path: 'gb28121-update',
  //       component: () => import(/* webpackChunkName: "up-platform" */ '@/views/upPlatform/create.vue'),
  //       name: 'up-platform-gb28121-update',
  //       meta: {
  //         title: '编辑国标级联',
  //         hidden: true,
  //         perms: ['*'],
  //         activeMenu: '/up-platform/gb28121'
  //       }
  //     }
  //   ]
  // },
  {
    path: '/certificate',
    component: Layout,
    name: 'certificate',
    redirect: 'noredirect',
    meta: {
      title: '凭证管理',
      icon: 'menu-certificate',
      alwaysShow: true,
      version: 2,
      perms: ['*']
    },
    children: [
      {
        path: 'gb28181',
        component: () => import(/* webpackChunkName: "certificate" */ '@vss/device/components/Certificate/Gb28181/index.vue'),
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
        component: () => import(/* webpackChunkName: "certificate" */ '@vss/device/components/Certificate/Gb28181/Create.vue'),
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
        component: () => import(/* webpackChunkName: "certificate" */ '@vss/device/components/Certificate/Gb28181/Create.vue'),
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
        component: () => import(/* webpackChunkName: "certificate" */ '@vss/device/components/Certificate/Ga1400/index.vue'),
        name: 'ga1400',
        meta: {
          id: '20210424150201007004',
          name: 'certificate',
          title: 'GA1400凭证',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/certificate/ga1400'
        }
      },
      {
        path: 'ga1400/create',
        component: () => import(/* webpackChunkName: "certificate" */ '@vss/device/components/Certificate/Ga1400/Create.vue'),
        name: 'ga1400-create',
        meta: {
          id: '20210424150201007005',
          title: '新建GA1400凭证',
          hidden: true,
          perms: ['*'],
          activeMenu: '/certificate/ga1400'
        }
      },
      {
        path: 'ga1400/update/:id?',
        component: () => import(/* webpackChunkName: "certificate" */ '@vss/device/components/Certificate/Ga1400/Create.vue'),
        name: 'ga1400-update',
        meta: {
          id: '20210424150201007006',
          title: '编辑GA1400凭证',
          hidden: true,
          perms: ['*'],
          activeMenu: '/certificate/ga1400'
        }
      }
    ]
  },
  {
    path: '/template',
    component: Layout,
    redirect: 'noredirect',
    name: 'Template',
    meta: {
      title: '模板管理',
      icon: 'menu-template',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*'],
      version: 2
    },
    children: [
      {
        path: 'record-video',
        component: () => import(/* webpackChunkName: "template" */ '@/views/Template/RecordV2/Video.vue'),
        name: 'RecordVideo',
        meta: {
          title: '存储模板',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/template/record-video'
        }
      },
      {
        path: 'record-viid',
        component: () => import(/* webpackChunkName: "template" */ '@/views/Template/RecordV2/Viid.vue'),
        name: 'RecordViid',
        meta: {
          title: '视图存储模板',
          icon: 'dot',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/record-video'
        }
      },
      {
        path: 'callback',
        component: () => import(/* webpackChunkName: "template" */ '@/views/Template/Callback/index.vue'),
        name: 'Callback',
        meta: {
          title: '回调模板',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/template/callback'
        }
      },
      {
        path: 'callback/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/Template/Callback/CreateOrUpdate.vue'),
        name: 'CallbackCreate',
        meta: {
          title: '新建回调模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/callback'
        }
      },
      {
        path: 'callback/update/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/Template/Callback/CreateOrUpdate.vue'),
        name: 'CallbackUpdate',
        meta: {
          title: '编辑回调模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/callback'
        }
      },
      {
        path: 'alert',
        component: () => import(/* webpackChunkName: "template" */ '@/views/Template/Alert/index.vue'),
        name: 'Alert',
        meta: {
          title: '告警模板',
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/template/alert'
        }
      },
      {
        path: 'alert/create',
        component: () => import(/* webpackChunkName: "template" */ '@/views/Template/Alert/CreateOrUpdate.vue'),
        name: 'AlertCreate',
        meta: {
          title: '新建告警模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/alert'
        }
      },
      {
        path: 'alert/update/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/Template/Alert/CreateOrUpdate.vue'),
        name: 'AlertUpdate',
        meta: {
          title: '编辑告警模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/alert'
        }
      },
      {
        path: 'alert/details/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/Template/Alert/Details.vue'),
        name: 'AlertDetails',
        meta: {
          title: '模板详情',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/alert'
        }
      }
    ]
  },
  {
    path: '/ai',
    component: Layout,
    redirect: 'noredirect',
    name: 'AI',
    meta: {
      title: 'AI管理',
      icon: 'menu-ai',
      alwaysShow: true,
      perms: ['ivs:GetApp', 'ivs:AdminApp'],
      version: 2
    },
    children: [
      {
        path: 'mask-recognation',
        component: () => import(/* webpackChunkName: "ai" */ '@/views/AI/MaskRecognation/index.vue'),
        name: 'AIMaskRecognation',
        meta: {
          title: '口罩识别',
          icon: 'dot',
          hidden: true,
          breadcrumb: false,
          activeMenu: '/ai',
          perms: ['ivs:GetApp']
        }
      },
      {
        path: 'ai-app-list',
        component: () => import(/* webpackChunkName: "ai" */ '@/views/AI/AppList/index.vue'),
        name: 'AIAppList',
        meta: {
          title: 'AI应用',
          icon: 'dot',
          hidden: false,
          breadcrumb: true,
          only: true,
          activeMenu: '/ai/ai-app-list',
          perms: ['ivs:GetApp']
        }
      },
      {
        path: 'create',
        component: () => import(/* webpackChunkName: "ai" */ '@/views/AI/AppList/AddApp.vue'),
        name: 'AIAddApp',
        meta: {
          title: '添加应用',
          icon: 'dot',
          hidden: true,
          breadcrumb: true,
          activeMenu: '/ai/ai-app-list',
          perms: ['ivs:AdminApp']
        }
      },
      {
        path: 'edit',
        component: () => import(/* webpackChunkName: "ai" */ '@/views/AI/AppList/AddApp.vue'),
        name: 'AIEditApp',
        meta: {
          title: '编辑应用',
          icon: 'dot',
          hidden: true,
          breadcrumb: true,
          activeMenu: '/ai/ai-app-list',
          perms: ['ivs:AdminApp']
        }
      },
      {
        path: 'detail',
        component: () => import(/* webpackChunkName: "ai" */ '@/views/AI/AppList/AppDetail.vue'),
        name: 'AIAppDetail',
        meta: {
          title: '应用详情',
          icon: 'dot',
          hidden: true,
          breadcrumb: false,
          activeMenu: '/ai/ai-app-list',
          perms: ['ivs:GetApp']
        }
      },
      {
        path: 'config',
        component: () => import(/* webpackChunkName: "ai" */ '@/views/AI/Config/index.vue'),
        name: 'AIConfig',
        meta: {
          title: '人脸库',
          icon: 'dot',
          hidden: true,
          breadcrumb: true,
          activeMenu: '/ai/config',
          perms: ['ivs:AdminApp']
        }
      },
      {
        path: 'facelib',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/Face/index.vue'),
        name: 'facelib',
        meta: {
          title: '人脸库',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/ai/facelib',
          perms: ['ivs:AdminApp']
        }
      },
      {
        path: 'facelib/detail',
        component: () => import(/* webpackChunkName: "AI" */ '@/views/AI/Face/Personal.vue'),
        name: 'facelib-detail',
        meta: {
          title: '人脸库详情',
          icon: 'dot',
          hidden: true,
          activeMenu: '/ai/facelib',
          perms: ['ivs:AdminApp']
        }
      }
    ]
  },
  {
    path: '/access-manage',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '访问管理',
      icon: 'menu-iam',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*'],
      version: 2
    },
    children: [
      {
        path: 'dashboard',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/User/Dashboard.vue'),
        name: 'AccessManageDashboard',
        meta: {
          title: '概览',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/access-manage/dashboard',
          perms: ['*']
        }
      },
      {
        path: 'user',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/User/index.vue'),
        name: 'AccessManageUser',
        meta: {
          title: '用户',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/access-manage/user',
          perms: ['*']
        }
      },
      {
        path: 'user/create',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/User/components/CreateUser.vue'),
        name: 'AccessManageUserCreate',
        meta: {
          title: '创建用户',
          icon: 'dot',
          hidden: true,
          activeMenu: '/access-manage/user',
          perms: ['*']
        }
      },
      {
        path: 'user/detail',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/User/components/UserDetail.vue'),
        name: 'AccessManageUserDetail',
        meta: {
          title: '成员详情',
          icon: 'dot',
          hidden: true,
          activeMenu: '/access-manage/user',
          perms: ['*']
        }
      },
      {
        path: 'policy',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/Policy/index.vue'),
        name: 'AccessManagePolicy',
        meta: {
          title: '策略',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/access-manage/policy',
          perms: ['*']
        }
      },
      {
        path: 'policy/create',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/Policy/components/CreatePolicy.vue'),
        name: 'AccessManagePolicyCreate',
        meta: {
          title: '创建策略',
          icon: 'dot',
          hidden: true,
          activeMenu: '/access-manage/policy',
          perms: ['*']
        }
      },
      {
        path: 'policy/edit/:id?',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/Policy/components/CreatePolicy.vue'),
        name: 'AccessManagePolicyEdit',
        meta: {
          title: '查看&编辑策略',
          icon: 'dot',
          hidden: true,
          activeMenu: '/access-manage/policy',
          perms: ['*']
        }
      },
      {
        path: 'role',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/Role/index.vue'),
        name: 'AccessManageRole',
        meta: {
          title: '角色',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/access-manage/role',
          perms: ['*']
        }
      },
      {
        path: 'role/create',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/Role/components/CreateRole.vue'),
        name: 'AccessManageRoleCreate',
        meta: {
          title: '创建角色',
          icon: 'dot',
          hidden: true,
          activeMenu: '/access-manage/role',
          perms: ['*']
        }
      },
      {
        path: 'secretManage',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/SecretManage/index.vue'),
        name: 'AccessManageSecretManage',
        meta: {
          title: 'API密钥',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/access-manage/secretManage',
          perms: ['*']
        }
      },
      {
        path: 'accessRestriction',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManage/AccessRestriction/index.vue'),
        name: 'AccessRestrictionManage',
        meta: {
          title: '访问限制',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/access-manage/accessRestriction',
          perms: ['*']
        }
      }
    ]
  },
  {
    path: '/operation-center',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '运营中心',
      icon: 'menu-alarm',
      perms: ['*'],
      alwaysShow: true,
      groupSelector: false,
      version: 2
    },
    children: [
      {
        path: 'alarm',
        component: () => import(/* webpackChunkName: "alarm" */ '@/views/Alarm/index.vue'),
        name: 'Alarm',
        meta: {
          title: '设备告警',
          icon: 'dot',
          breadcrumb: false,
          perms: ['ivs:frontend:AdminAlarm'],
          groupSelector: false
        },
        children: [
          {
            path: '',
            component: () => import(/* webpackChunkName: "alarm" */ '@/views/Alarm/List.vue'),
            name: 'AlarmList',
            meta: {
              title: '设备告警',
              breadcrumb: true,
              icon: 'dot',
              perms: ['ivs:frontend:AdminAlarm'],
              activeMenu: '/operation-center/alarm',
              groupSelector: false
            }
          }
        ]
      },
      {
        path: 'statistic',
        component: () => import(/* webpackChunkName: "export-devices" */ '@/views/Statistic/index.vue'),
        name: 'statistic',
        meta: {
          title: '统计信息',
          breadcrumb: true,
          icon: 'dot',
          perms: ['*'],
          tags: {
            isShowRecordInfo: ['Y']
          }
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
      icon: 'menu-notification',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*'],
      version: 2
    },
    children: [
      {
        path: 'history',
        component: () => import(/* webpackChunkName: "notification" */ '@/views/Notification/History/index.vue'),
        name: 'NotificationHistory',
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
        component: () => import(/* webpackChunkName: "notification" */ '@/views/Notification/Policy/index.vue'),
        name: 'NotificationPolicy',
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
        component: () => import(/* webpackChunkName: "notification" */ '@/views/Notification/Policy/CreateOrUpdate.vue'),
        name: 'NotificationPolicyCreate',
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
        component: () => import(/* webpackChunkName: "notification" */ '@/views/Notification/Policy/CreateOrUpdate.vue'),
        name: 'NotificationPolicyEdit',
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
    path: '/car',
    component: Layout,
    meta: {
      id: '20210515200901013321',
      title: '车辆管理',
      breadcrumb: true,
      icon: 'menu-car',
      perms: ['ivs:AdminCar'],
      version: 2
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "car" */ '@/views/Car/index.vue'),
        name: 'Car',
        meta: {
          id: '20210515200901013321',
          title: '车辆管理',
          breadcrumb: false,
          icon: 'car',
          perms: ['ivs:AdminCar']
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
      icon: 'menu-billing',
      alwaysShow: true,
      perms: ['ivs:frontend:AdminBilling'],
      version: 2,
      only: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "billing" */ '@/views/Billing/index.vue'),
        name: 'Billing',
        redirect: 'resource',
        meta: {
          title: '计费管理',
          perms: ['ivs:frontend:AdminBilling'],
          icon: 'menu-billing',
          hidden: true,
          activeMenu: '/billing',
          breadcrumb: false
        },
        children: [
          {
            path: 'ondemand',
            component: () => import(/* webpackChunkName: "billing" */ '@/views/Billing/OnDemand/index.vue'),
            name: 'OnDemand',
            meta: {
              title: '按需计费管理',
              icon: 'dot',
              hidden: true,
              activeMenu: '/billing',
              perms: ['ivs:frontend:AdminBilling']
            }
          },
          {
            path: 'resource',
            component: () => import(/* webpackChunkName: "billing" */ '@/views/Billing/Resource/index.vue'),
            name: 'BillingResource',
            meta: {
              title: '资源包管理',
              icon: 'dot',
              hidden: true,
              activeMenu: '/billing',
              perms: ['ivs:frontend:AdminBilling']
            }
          },
          {
            path: 'resource/management',
            component: () => import(/* webpackChunkName: "billing" */ '@/views/Billing/Resource/Manage.vue'),
            name: 'BillingResourceManagement',
            meta: {
              title: '资源包管理',
              icon: 'dot',
              hidden: true,
              activeMenu: '/billing',
              perms: ['ivs:frontend:AdminBilling']
            }
          }
        ]
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
      tags: ['isLianZhouEdu'],
      version: 2
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "export-devices" */ '@/views/ExportDevices/index.vue'),
        name: 'ExportDevices',
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
    path: '/dosageStatistics',
    component: Layout,
    meta: {
      title: '用量统计',
      icon: 'chart',
      breadcrumb: true,
      perms: ['*'],
      version: 2
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "export-devices" */ '@/views/DosageStatistics/index.vue'),
        name: 'DosageStatistics',
        meta: {
          title: '用量统计',
          icon: 'chart',
          breadcrumb: false,
          perms: ['*'],
          activeMenu: '/dosageStatistics'
        }
      }
    ]
  },
  {
    path: '/sysconfig',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '系统管理',
      breadcrumb: true,
      alwaysShow: true,
      icon: 'menu-system',
      perms: ['*'],
      version: 2
    },
    children: [
      {
        path: 'operation-log',
        component: () => import(/* webpackChunkName: "sysconfig" */ '@/views/OperationLog/index.vue'),
        name: 'operation-log',
        meta: {
          title: '操作日志',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/sysconfig/operation-log',
          perms: ['*']
        }
      },
      {
        path: 'custom-tree',
        component: () => import(/* webpackChunkName: "sysconfig" */ '@/views/SysConfig/CustomTree/index.vue'),
        name: 'CustomTree',
        meta: {
          title: '自定义设备树',
          breadcrumb: true,
          activeMenu: '/sysconfig/custom-tree',
          icon: 'dot',
          perms: ['*']
        }
      },
      {
        path: 'replay-lock-manage',
        component: () => import(/* webpackChunkName: "sysconfig" */ '@/views/device/ReplayLockManage.vue'),
        name: 'ReplayLockManage',
        meta: {
          title: '锁定录像管理',
          breadcrumb: true,
          icon: 'dot',
          perms: ['*'],
          activeMenu: '/sysconfig/replay-lock-manage',
          tags: {
            isRecordLockAvailable: ['Y']
          }
        }
      },
      {
        path: 'system-config',
        component: () => import(/* webpackChunkName: "sysconfig" */ '@/views/SysConfig/index.vue'),
        name: 'SysConfig',
        meta: {
          title: '系统设置',
          breadcrumb: true,
          activeMenu: '/sysconfig/system-config',
          icon: 'dot',
          perms: ['*']
        }
      }
    ]
  },
  {
    path: '/changePassword',
    component: Layout,
    meta: {
      title: '修改密码',
      icon: 'tree',
      hidden: true,
      breadcrumb: true,
      version: 2
    },
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "common-async-page" */ '@/views/changePassword/index.vue'),
        meta: {
          title: '修改密码',
          icon: 'tree',
          breadcrumb: false
        }
      }
    ]
  },
  {
    path: '/player-debug',
    component: () => import(/* webpackChunkName: "debug" */ '@vss/vss-video-player/Debug.vue'),
    name: 'PlayerDebug',
    meta: {
      title: '播放器调试',
      icon: 'menu-replay',
      hidden: true,
      perms: ['*'],
      version: 2
    }
  },
  {
    path: '/replay-debug2',
    component: () => import(/* webpackChunkName: "debug" */ '@vss/device/components/ReplayPlayer/Debug3.vue'),
    name: 'ReplayDebug2',
    meta: {
      title: '录像调试',
      icon: 'menu-replay',
      hidden: true,
      perms: ['*'],
      version: 2
    }
  }
]
