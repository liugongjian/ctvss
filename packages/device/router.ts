import Layout from '@/layout/index.vue'
import { createDeviceIbox, getDevicesIbox, getDeviceIbox } from './api/device'

export const deviceRouter = {
  path: '/device-refactor',
  component: Layout,
  meta: {
    title: '设备管理',
    icon: 'menu-device',
    perms: ['DescribeDevice'],
    alwaysShow: false,
    only: true,
    groupSelector: false
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
        groupSelector: false
      },
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'DeviceList',
          meta: {
            title: '设备列表',
            perms: ['DescribeDevice'],
            activeMenu: '/device-refactor'
          }
        },
        {
          path: 'detail',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/index.vue'),
          name: 'DeviceDetail',
          meta: {
            title: '设备详情',
            perms: ['DescribeDevice'],
            activeMenu: '/device-refactor'
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
                activeMenu: '/device-detail'
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
                activeMenu: '/device-detail'
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
                activeMenu: '/device-detail'
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
                activeMenu: '/device-detail'
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
                activeMenu: '/device-detail'
              }
            },
            {
              path: 'ai',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceAi.vue'),
              name: 'DeviceAi',
              meta: {
                title: 'AI分析',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/device-detail'
              }
            },
            {
              path: 'viid',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceViid.vue'),
              name: 'DeviceViid',
              meta: {
                title: '视图库',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/device-detail'
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
            activeMenu: '/device-refactor'
          }
        }
      ]
    }
  ]
}

export const videoRouter = {
  path: '/video',
  component: Layout,
  redirect: 'noredirect',
  meta: {
    title: '视频服务',
    icon: 'menu-live',
    perms: ['DescribeDevice'],
    alwaysShow: true,
    breadcrumb: true
  },
  children: [
    {
      path: 'preview',
      component: () => import(/* webpackChunkName: "device" */ './Preview.vue'),
      name: 'preview',
      meta: {
        title: '实时预览',
        breadcrumb: false,
        perms: ['DescribeDevice']
      },
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'DeviceList',
          meta: {
            title: '实时预览',
            icon: 'dot',
            perms: ['DescribeDevice'],
            activeMenu: '/video/preview'
          }
        }
      ]
    },
    {
      path: 'replay',
      component: () => import(/* webpackChunkName: "device" */ './Replay.vue'),
      name: 'replay',
      meta: {
        title: '录像回放',
        breadcrumb: false,
        perms: ['DescribeDevice']
      },
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'DeviceList',
          meta: {
            title: '录像回放',
            icon: 'dot',
            perms: ['DescribeDevice'],
            activeMenu: '/video/replay'
          }
        }
      ]
    }
  ]
}

export const iboxRouter = {
  path: '/ibox',
  component: Layout,
  redirect: 'noredirect',
  meta: {
    title: 'ibox',
    icon: 'menu-live',
    perms: ['DescribeDevice'],
    alwaysShow: false
  },
  children: [
    {
      path: 'test',
      component: () => import(/* webpackChunkName: "device" */ './IboxTest.vue'),
      name: 'ibox-test',
      meta: {
        title: 'ibox',
        icon: 'menu-device',
        breadcrumb: false,
        alwaysShow: false,
        perms: ['DescribeDevice'],
        groupSelector: true
      }
    },
    {
      path: '',
      component: () => import(/* webpackChunkName: "device" */ './Device.vue'),
      name: 'ibox-refactor',
      meta: {
        title: 'ibox',
        icon: 'menu-device',
        breadcrumb: false,
        alwaysShow: false,
        hidden: true,
        perms: ['DescribeDevice'],
        groupSelector: true
      },
      children: [
        {
          path: 'list',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'IboxDeviceList',
          props: {
            getDevicesApi: getDevicesIbox
          },
          meta: {
            title: '设备列表',
            perms: ['DescribeDevice'],
            activeMenu: '/ibox',
            groupSelector: true
          }
        },
        {
          path: 'detail',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/index.vue'),
          name: 'IboxDeviceDetail',
          meta: {
            title: '设备详情',
            perms: ['DescribeDevice'],
            activeMenu: '/ibox',
            groupSelector: true
          },
          children: [
            {
              path: '',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceInfo/index.vue'),
              name: 'IboxDeviceDetailInfo',
              props: {
                isIbox: true,
                getDeviceApi: getDeviceIbox
              },
              meta: {
                title: '基本信息',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/ibox',
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
                activeMenu: '/ibox',
                groupSelector: true
              }
            },
            {
              path: 'config',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceConfig/index.vue'),
              name: 'DeviceConfig',
              props: {
                isIbox: true,
                getDeviceApi: getDeviceIbox
              },
              meta: {
                title: '配置信息',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/ibox',
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
                activeMenu: '/ibox',
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
                activeMenu: '/ibox',
                groupSelector: true
              }
            },
            {
              path: 'ai',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceAi.vue'),
              name: 'DeviceAi',
              meta: {
                title: 'AI分析',
                breadcrumb: false,
                perms: ['DescribeDevice'],
                activeMenu: '/ibox',
                groupSelector: true
              }
            }
          ]
        },
        {
          path: 'create',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceCreate/index.vue'),
          name: 'IboxDeviceCreate',
          props: {
            isIbox: true,
            createDeviceApi: createDeviceIbox
          },
          meta: {
            title: '创建设备',
            perms: ['DescribeDevice'],
            activeMenu: '/ibox',
            groupSelector: true
          }
        }
      ]
    }
  ]
}
