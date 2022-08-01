import Layout from '@/layout/index.vue'

export default {
  path: '/device',
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
}
