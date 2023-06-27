import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'
import { createDeviceIbox, getDevicesIbox, getDeviceIbox } from './api/device'

export const deviceRouter: RouteConfig = {
  path: '/device',
  component: Layout,
  redirect: 'noredirect',
  meta: {
    title: '设备管理',
    icon: 'menu-device',
    perms: ['ivs:GetDevice', 'ivs:CreateDevice', 'ivs:UpdateDevice'],
    alwaysShow: false,
    only: true,
    groupSelector: false,
    version: 2
  },
  children: [
    {
      path: '',
      component: () => import(/* webpackChunkName: "device" */ './Device.vue'),
      name: 'device',
      meta: {
        title: '设备管理',
        icon: 'menu-device',
        breadcrumb: false,
        perms: ['ivs:GetDevice', 'ivs:CreateDevice', 'ivs:UpdateDevice'],
        groupSelector: false
      },
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'DeviceList',
          meta: {
            title: '设备列表',
            perms: ['ivs:GetDevice', 'ivs:CreateDevice', 'ivs:UpdateDevice'],
            activeMenu: '/device'
          }
        },
        {
          path: 'detail',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/index.vue'),
          name: 'DeviceDetail',
          meta: {
            title: '设备详情',
            perms: ['ivs:GetDevice'],
            activeMenu: '/device'
          },
          children: [
            {
              path: '',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceInfo/index.vue'),
              name: 'DeviceInfo',
              meta: {
                title: '基本信息',
                breadcrumb: false,
                perms: ['ivs:GetDevice'],
                activeMenu: '/device'
              }
            },
            {
              path: 'events',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceEvents.vue'),
              name: 'DeviceEvents',
              meta: {
                title: '设备/流信息',
                breadcrumb: false,
                perms: ['ivs:GetDevice'],
                activeMenu: '/device'
              }
            },
            {
              path: 'config',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceConfig/index.vue'),
              name: 'DeviceConfig',
              meta: {
                title: '配置信息',
                breadcrumb: false,
                perms: ['ivs:GetDevice'],
                activeMenu: '/device'
              }
            },
            {
              path: 'preview',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DevicePreview.vue'),
              name: 'DevicePreview',
              meta: {
                title: '实时预览',
                breadcrumb: false,
                perms: ['ivs:GetDevice'],
                activeMenu: '/device'
              }
            },
            {
              path: 'replay',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceReplay.vue'),
              name: 'DeviceReplay',
              meta: {
                title: '录像回放',
                breadcrumb: false,
                perms: ['ivs:GetDevice'],
                activeMenu: '/device'
              }
            },
            {
              path: 'ai',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceAi.vue'),
              name: 'DeviceAi',
              meta: {
                title: 'AI分析',
                breadcrumb: false,
                perms: ['ivs:GetDevice'],
                activeMenu: '/device'
              }
            },
            {
              path: 'viid',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceViid/index.vue'),
              name: 'DeviceViid',
              meta: {
                title: '视图库',
                breadcrumb: false,
                perms: ['ivs:GetDevice'],
                activeMenu: '/device'
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
            perms: ['ivs:CreateDevice'],
            activeMenu: '/device'
          }
        },
        {
          path: 'configureChannels',
          component: () => import(/* webpackChunkName: "device" */ './components/ConfigureChannels/index.vue'),
          name: 'ConfigureChannels',
          meta: {
            title: '配置子通道',
            perms: ['ivs:UpdateDevice'],
            activeMenu: '/device'
          }
        }
      ]
    }
  ]
}

export const videoRouter: RouteConfig = {
  path: '/video',
  component: Layout,
  redirect: 'noredirect',
  meta: {
    title: '视频服务',
    icon: 'menu-live',
    alwaysShow: true,
    breadcrumb: true,
    perms: ['ivs:GetLiveStream', 'ivs:ControlDevicePTZ', 'ivs:LockDevicePTZ', 'ivs:ControlDevicePreset', 'ivs:GetCloudRecord', 'ivs:GetDeviceRecord', 'ivs:DownloadCloudRecord', 'ivs:LockCloudRecord'],
    version: 2
  },
  children: [
    {
      path: 'preview',
      component: () => import(/* webpackChunkName: "device" */ './Preview.vue'),
      name: 'preview',
      meta: {
        title: '实时预览',
        breadcrumb: false,
        perms: ['ivs:GetLiveStream', 'ivs:ControlDevicePTZ', 'ivs:LockDevicePTZ', 'ivs:ControlDevicePreset']
      },
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'preview',
          meta: {
            title: '实时预览',
            icon: 'dot',
            perms: ['ivs:GetLiveStream', 'ivs:ControlDevicePTZ', 'ivs:LockDevicePTZ', 'ivs:ControlDevicePreset'],
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
        perms: ['ivs:GetCloudRecord', 'ivs:GetDeviceRecord', 'ivs:DownloadCloudRecord', 'ivs:LockCloudRecord']
      },
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceList/index.vue'),
          name: 'replay',
          meta: {
            title: '录像回放',
            icon: 'dot',
            perms: ['ivs:GetCloudRecord', 'ivs:GetDeviceRecord', 'ivs:DownloadCloudRecord', 'ivs:LockCloudRecord'],
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
    perms: ['ivs:GetDevice'],
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
        perms: ['ivs:GetDevice'],
        groupSelector: false
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
        perms: ['ivs:GetDevice'],
        groupSelector: false
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
            perms: ['ivs:GetDevice'],
            activeMenu: '/ibox',
            groupSelector: false
          }
        },
        {
          path: 'detail',
          component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/index.vue'),
          name: 'IboxDeviceDetail',
          meta: {
            title: '设备详情',
            perms: ['ivs:GetDevice'],
            activeMenu: '/ibox',
            groupSelector: false
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
                perms: ['ivs:GetDevice'],
                activeMenu: '/ibox',
                groupSelector: false
              }
            },
            {
              path: 'events',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceEvents.vue'),
              name: 'DeviceEvents',
              meta: {
                title: '设备/流信息',
                breadcrumb: false,
                perms: ['ivs:GetDevice'],
                activeMenu: '/ibox',
                groupSelector: false
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
                perms: ['ivs:GetDevice'],
                activeMenu: '/ibox',
                groupSelector: false
              }
            },
            {
              path: 'preview',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DevicePreview.vue'),
              name: 'DevicePreview',
              meta: {
                title: '实时预览',
                breadcrumb: false,
                perms: ['ivs:GetLiveStream'],
                activeMenu: '/ibox',
                groupSelector: false
              }
            },
            {
              path: 'replay',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceReplay.vue'),
              name: 'DeviceReplay',
              meta: {
                title: '录像回放',
                breadcrumb: false,
                perms: ['ivs:GetCloudRecord'],
                activeMenu: '/ibox',
                groupSelector: false
              }
            },
            {
              path: 'ai',
              component: () => import(/* webpackChunkName: "device" */ './components/DeviceDetail/DeviceAi.vue'),
              name: 'DeviceAi',
              meta: {
                title: 'AI分析',
                breadcrumb: false,
                perms: ['ivs:GetDevice'],
                activeMenu: '/ibox',
                groupSelector: false
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
            perms: ['ivs:CreateDevice'],
            activeMenu: '/ibox',
            groupSelector: false
          }
        }
      ]
    }
  ]
}
