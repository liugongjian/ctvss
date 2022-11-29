import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

export const v1Router: RouteConfig[] = [
  {
    path: '/dashboard',
    component: Layout,
    meta: {
      title: '概览',
      icon: 'menu-dashboard',
      breadcrumb: false,
      perms: ['DescribeDashboard'],
      alwaysShow: false,
      version: 1
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
          perms: ['DescribeDashboard']
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
          perms: ['DescribeDashboard']
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
      icon: 'menu-group',
      perms: ['DescribeGroup'],
      alwaysShow: false,
      version: 1
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "group" */ '@/views/group/index.vue'),
        name: 'group-list',
        meta: {
          title: '业务组管理',
          icon: 'menu-group',
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
          icon: 'menu-group',
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
          icon: 'menu-group',
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
          icon: 'menu-group',
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
      icon: 'menu-device',
      perms: ['DescribeDevice'],
      alwaysShow: false,
      only: true,
      groupSelector: true,
      version: 1,
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "device" */ '@/views/device/index.vue'),
        name: 'device',
        meta: {
          title: '设备管理',
          icon: 'menu-device',
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
            component: () => import(/* webpackChunkName: "device-create" */ '@/views/device/Create.vue'),
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
            component: () => import(/* webpackChunkName: "device-create" */ '@/views/device/Create.vue'),
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
            component: () => import(/* webpackChunkName: "device-detail" */ '@/views/device/Detail.vue'),
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
            component: () => import(/* webpackChunkName: "device-create" */ '@/views/device/ConfigChannel.vue'),
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
  {
    path: '/screen',
    component: Layout,
    meta: {
      title: '实时预览',
      icon: 'menu-live',
      perms: ['ScreenPreview'],
      alwaysShow: false,
      groupSelector: true,
      version: 1
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "screen" */ '@/views/device/Live.vue'),
        name: 'screen',
        meta: {
          title: '实时预览',
          icon: 'menu-live',
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
    component: () => import(/* webpackChunkName: "debug" */ '@vss/vss-video-player/Debug.vue'),
    name: 'device-debug',
    meta: {
      title: '播放器调试',
      icon: 'menu-replay',
      hidden: true,
      perms: ['*'],
      version: 1
    }
  },
  {
    path: '/replay-debug',
    component: () => import(/* webpackChunkName: "debug" */ '@/views/device/components/ReplayPlayer/Debug.vue'),
    name: 'replay-debug',
    meta: {
      title: '录像调试',
      icon: 'menu-replay',
      hidden: true,
      perms: ['*'],
      version: 1
    }
  },
  {
    path: '/replay-debug2',
    component: () => import(/* webpackChunkName: "debug" */ '@/views/device/components/ReplayPlayer/Debug3.vue'),
    name: 'replay-debug2',
    meta: {
      title: '录像调试',
      icon: 'menu-replay',
      hidden: true,
      perms: ['*'],
      version: 1
    }
  },
  {
    path: '/replay',
    component: Layout,
    meta: {
      title: '录像回放',
      icon: 'menu-replay',
      perms: ['ReplayRecord'],
      alwaysShow: false,
      groupSelector: true,
      version: 1
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "screen" */ '@/views/device/Replay.vue'),
        name: 'replay',
        meta: {
          title: '录像回放',
          icon: 'menu-replay',
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
      icon: 'menu-map',
      perms: ['DescribeMap'],
      alwaysShow: false,
      only: true,
      groupSelector: false,
      version: 1
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "map" */ '@/views/MapV1/index.vue'),
        name: 'map',
        meta: {
          title: '电子地图',
          icon: 'menu-map',
          breadcrumb: false,
          perms: ['DescribeMap'],
          activeMenu: '/map'
        }
      }
    ]
  },
  {
    path: '/up-platform',
    component: Layout,
    redirect: 'noredirect',
    meta: {
      title: '向上级联',
      icon: 'menu-up-platform',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*'],
      version: 1
    },
    children: [
      {
        path: 'gb28121',
        component: () => import(/* webpackChunkName: "up-platform" */ '@/views/upPlatformV1/index.vue'),
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
        component: () => import(/* webpackChunkName: "up-platform" */ '@/views/upPlatformV1/create.vue'),
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
        component: () => import(/* webpackChunkName: "up-platform" */ '@/views/upPlatformV1/create.vue'),
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
    path: '/certificate',
    component: Layout,
    name: 'certificate',
    redirect: 'noredirect',
    meta: {
      title: '凭证管理',
      icon: 'menu-certificate',
      alwaysShow: true,
      perms: ['*'],
      version: 1
    },
    children: [
      {
        path: 'gb28181',
        component: () => import(/* webpackChunkName: "certificate" */ '@/views/Certificate/Gb28181/index.vue'),
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
        component: () => import(/* webpackChunkName: "certificate" */ '@/views/Certificate/Gb28181/Create.vue'),
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
        component: () => import(/* webpackChunkName: "certificate" */ '@/views/Certificate/Gb28181/Create.vue'),
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
        component: () => import(/* webpackChunkName: "certificate" */ '@/views/Certificate/Ga1400/index.vue'),
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
        component: () => import(/* webpackChunkName: "certificate" */ '@/views/Certificate/Ga1400/Create.vue'),
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
        component: () => import(/* webpackChunkName: "certificate" */ '@/views/Certificate/Ga1400/Create.vue'),
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
    name: 'Template',
    meta: {
      title: '模板管理',
      icon: 'menu-template',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*'],
      version: 1
    },
    children: [
      {
        path: 'record',
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Record/index.vue'),
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
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Record/CreateOrUpdate.vue'),
        name: 'recordCreate',
        meta: {
          title: '新建录制模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/record'
        }
      },
      {
        path: 'record/update/:id?',
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Record/CreateOrUpdate.vue'),
        name: 'recordUpdate',
        meta: {
          title: '编辑录制模板',
          hidden: true,
          perms: ['*'],
          activeMenu: '/template/record'
        }
      },
      {
        path: 'callback',
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Callback/index.vue'),
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
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Callback/CreateOrUpdate.vue'),
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
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Callback/CreateOrUpdate.vue'),
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
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Alert/index.vue'),
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
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Alert/CreateOrUpdate.vue'),
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
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Alert/CreateOrUpdate.vue'),
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
        component: () => import(/* webpackChunkName: "template" */ '@/views/TemplateV1/Alert/Details.vue'),
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
      perms: ['DescribeAi'],
      version: 1
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
          perms: ['DescribeAi']
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
          perms: ['DescribeAi']
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
          perms: ['AdminAi']
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
          perms: ['AdminAi']
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
          perms: ['DescribeAi']
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
          perms: ['AdminAi']
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
          perms: ['AdminAi']
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
          perms: ['AdminAi']
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
      version: 1
    },
    children: [
      {
        path: 'dashboard',
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/User/Dashboard.vue'),
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
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/User/index.vue'),
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
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/User/components/CreateUser.vue'),
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
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/User/components/UserDetail.vue'),
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
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/Policy/index.vue'),
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
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/Policy/components/CreatePolicy.vue'),
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
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/Policy/components/CreatePolicy.vue'),
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
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/Role/index.vue'),
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
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/Role/components/CreateRole.vue'),
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
        component: () => import(/* webpackChunkName: "iam" */ '@/views/AccessManageV1/SecretManage/index.vue'),
        name: 'AccessManageSecretManage',
        meta: {
          title: 'API密钥',
          icon: 'dot',
          breadcrumb: true,
          activeMenu: '/access-manage/secretManage',
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
      icon: 'menu-notification',
      alwaysShow: true,
      breadcrumb: true,
      perms: ['*'],
      version: 1
    },
    children: [
      {
        path: 'history',
        component: () => import(/* webpackChunkName: "notification" */ '@/views/NotificationV1/History/index.vue'),
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
        component: () => import(/* webpackChunkName: "notification" */ '@/views/NotificationV1/Policy/index.vue'),
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
        component: () => import(/* webpackChunkName: "notification" */ '@/views/NotificationV1/Policy/CreateOrUpdate.vue'),
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
        component: () => import(/* webpackChunkName: "notification" */ '@/views/NotificationV1/Policy/CreateOrUpdate.vue'),
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
    path: '/alarm',
    component: Layout,
    meta: {
      title: '告警管理',
      icon: 'menu-alarm',
      perms: ['*'],
      alwaysShow: false,
      only: true,
      groupSelector: true,
      version: 1
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "alarm" */ '@/views/AlarmV1/index.vue'),
        name: 'Alarm',
        meta: {
          title: '告警管理',
          icon: 'menu-alarm',
          breadcrumb: false,
          perms: ['*'],
          groupSelector: true
        },
        children: [
          {
            path: '',
            component: () => import(/* webpackChunkName: "alarm" */ '@/views/AlarmV1/List.vue'),
            name: 'AlarmList',
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
      icon: 'menu-car',
      perms: ['AdminCar'],
      version: 1
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "car" */ '@/views/CarV1/index.vue'),
        name: 'Car',
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
      icon: 'menu-billing',
      alwaysShow: true,
      perms: ['*'],
      version: 1
    },
    children: [
      {
        path: 'resource',
        component: () => import(/* webpackChunkName: "billing" */ '@/views/Billing/Resource/index.vue'),
        name: 'BillingResource',
        meta: {
          title: '资源包管理',
          icon: 'dot',
          perms: ['*']
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
      tags: ['isLianZhouEdu'],
      version: 1
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
    path: '/sysconfig',
    component: Layout,
    meta: {
      title: '系统设置',
      breadcrumb: true,
      icon: 'menu-system',
      perms: ['*'],
      version: 1
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "export-devices" */ '@/views/SysConfig/index.vue'),
        name: 'SysConfig',
        meta: {
          title: '系统设置',
          breadcrumb: false,
          icon: 'menu-system',
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
      version: 1
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
  }
]