import Layout from '@/layout/index.vue'

export default {
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
      component: () => import(/* webpackChunkName: "device" */ './index.vue'),
      name: 'device-refactor',
      meta: {
        title: '设备管理重构',
        icon: 'menu-device',
        breadcrumb: false,
        perms: ['DescribeDevice'],
        groupSelector: true
      }
      // children: [
      //   {
      //     path: '',
      //     component: () => import(/* webpackChunkName: "device" */ '@/views/device/List.vue'),
      //     name: 'device-list',
      //     meta: {
      //       title: '设备列表',
      //       breadcrumb: false,
      //       perms: ['DescribeDevice'],
      //       activeMenu: '/device',
      //       groupSelector: true
      //     }
      //   }
      // ]
    }
  ]
}
