import Layout from '@/layout/index.vue'

export const deviceRouter = {
  path: '/device-refactor',
  component: Layout,
  meta: {
    title: '设备管理',
    icon: 'menu-device',
    perms: ['DescribeDevice'],
    alwaysShow: false,
    only: true,
    groupSelector: true
  },
  children: [
    {
      path: '',
      component: () => import(/* webpackChunkName: "device" */ './Device.vue'),
      name: 'device-refactor',
      meta: {
        title: '设备管理重构',
        icon: 'menu-device',
        breadcrumb: false,
        perms: ['DescribeDevice'],
        groupSelector: true
      },
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'DeviceList',
          meta: {
            title: '设备列表',
            perms: ['DescribeDevice'],
            activeMenu: '/device-refactor',
            groupSelector: true
          }
        },
        {
          path: 'detail',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/index.vue'),
          name: 'DeviceDetail',
          meta: {
            title: '设备详情',
            perms: ['DescribeDevice'],
            activeMenu: '/device-refactor',
            groupSelector: true
          },
          children: [
            {
              path: '',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceInfo/index.vue'),
              name: 'DeviceInfo',
              meta: {
                title: '基本信息',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/device-detail',
                groupSelector: true
              }
            },
            {
              path: 'events',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceEvents.vue'),
              name: 'DeviceEvents',
              meta: {
                title: '设备/流信息',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/device-detail',
                groupSelector: true
              }
            },
            {
              path: 'config',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceConfig/index.vue'),
              name: 'DeviceConfig',
              meta: {
                title: '配置信息',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/device-detail',
                groupSelector: true
              }
            },
            {
              path: 'preview',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DevicePreview.vue'),
              name: 'DevicePreview',
              meta: {
                title: '实时预览',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/device-detail',
                groupSelector: true
              }
            },
            {
              path: 'replay',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceReplay.vue'),
              name: 'DeviceReplay',
              meta: {
                title: '录像回放',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/device-detail',
                groupSelector: true
              }
            },
            {
              path: 'ai',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceAI.vue'),
              name: 'DeviceAI',
              meta: {
                title: 'AI分析',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/device-detail',
                groupSelector: true
              }
            },
            {
              path: 'viid',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceVIID.vue'),
              name: 'DeviceVIID',
              meta: {
                title: '视图库',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/device-detail',
                groupSelector: true
              }
            }
          ]
        },
        {
          path: 'create',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceCreate/index.vue'),
          name: 'DeviceCreate',
          meta: {
            title: '创建设备',
            perms: ['DescribeDevice'],
            activeMenu: '/device-refactor',
            groupSelector: true
          }
        }
      ]
    }
  ]
}

export const previewRouter = {
  path: '/preview-refactor',
  component: Layout,
  meta: {
    title: '实时预览',
    icon: 'menu-device',
    perms: ['DescribeDevice'],
    alwaysShow: false,
    only: true,
    groupSelector: true
  },
  children: [
    {
      path: '',
      component: () => import(/* webpackChunkName: "device" */ './Preview.vue'),
      name: 'preview-refactor',
      meta: {
        title: '实时预览重构',
        icon: 'menu-device',
        breadcrumb: false,
        perms: ['DescribeDevice'],
        groupSelector: true
      },
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'DeviceList',
          meta: {
            title: '设备列表',
            perms: ['DescribeDevice'],
            activeMenu: '/preview-refactor',
            groupSelector: true
          }
        }
      ]
    }
  ]
}

export const replayRouter = {
  path: '/replay-refactor',
  component: Layout,
  meta: {
    title: '录像回放',
    icon: 'menu-device',
    perms: ['DescribeDevice'],
    alwaysShow: false,
    only: true,
    groupSelector: true
  },
  children: [
    {
      path: '',
      component: () => import(/* webpackChunkName: "device" */ './Replay.vue'),
      name: 'replay-refactor',
      meta: {
        title: '录像回放重构',
        icon: 'menu-device',
        breadcrumb: false,
        perms: ['DescribeDevice'],
        groupSelector: true
      },
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'DeviceList',
          meta: {
            title: '设备列表',
            perms: ['DescribeDevice'],
            activeMenu: '/replay-refactor',
            groupSelector: true
          }
        }
      ]
    }
  ]
}
