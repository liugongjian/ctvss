interface ISettings {
  title: string // Overrides the default title
  showSettings: boolean // Controls settings panel display
  showTagsView: boolean // Controls tagsview display
  showSidebarLogo: boolean // Controls siderbar logo display
  fixedHeader: boolean // If true, will fix the header component
  errorLog: string[] // The env to enable the errorlog component, default 'production' only
  sidebarTextTheme: boolean // If true, will change active text color for sidebar based on theme
  projectPrefix: string // 项目前缀路径
  outNetworkWhiteList: Array<string> // 公网白名单
  privateDenyPerms: {
    [index: string]: Array<string>
  },
  systemActionList: {
    actionName: string;
    actionValue: string;
    actionDesc: string;
    actionType?: string;
    autoSelected?: string;
  }[]
}

// You can customize below settings :)
const settings: ISettings = {
  title: '视频监控',
  showSettings: true,
  showTagsView: true,
  fixedHeader: false,
  showSidebarLogo: false,
  errorLog: ['production'],
  sidebarTextTheme: true,
  projectPrefix: '/vss',
  outNetworkWhiteList: [
    '182.43.127.35',
    'console.vcn.ctyun.cn',
    'console.vcn.ctcdn.cn'
  ],
  privateDenyPerms: {
    liuzhou: ['DescribeMap', 'DescribeViid', 'AdminViid', 'AdminCar'],
    yeji: ['DescribeMap', 'DescribeViid', 'AdminViid', 'AdminCar', 'AdminAlarm', 'AdminNotification', 'AdminBilling']
  },
  systemActionList: [
    {
      actionName: '查看业务组',
      actionValue: 'DescribeGroup',
      actionDesc: '拥有业务组的查看权限，可以展示业务组管理菜单',
      actionType: 'GET' // GET权限的用户会默认设置该perm
    },
    {
      actionName: '管理业务组',
      actionValue: 'AdminGroup',
      actionDesc: '拥有业务组的管理权限，可对业务组进行管理操作',
      autoSelected: 'DescribeGroup' // 勾选后默认勾选的其他aciton
    },
    {
      actionName: '查询设备',
      actionValue: 'DescribeDevice',
      actionDesc: '具有设备查询的权限，可以展示设备管理菜单',
      actionType: 'GET'
    },
    {
      actionName: '管理设备',
      actionValue: 'AdminDevice',
      actionDesc: '拥有设备管理的权限，可对设备进行管理操作',
      autoSelected: 'DescribeDevice'
    },
    {
      actionName: '实时预览',
      actionValue: 'ScreenPreview',
      actionDesc: '具备实时预览菜单',
      actionType: 'GET'
    },
    {
      actionName: '录像回放',
      actionValue: 'ReplayRecord',
      actionDesc: '具备录像回放菜单',
      actionType: 'GET'
    },
    {
      actionName: '管理录像',
      actionValue: 'AdminRecord',
      actionDesc: '拥有录像下载，录像文件改名的权限',
      autoSelected: 'ReplayRecord'
    },
    {
      actionName: '查看视图服务',
      actionValue: 'DescribeViid',
      actionDesc: '具有视图服务菜单',
      actionType: 'GET'
    },
    {
      actionName: '管理视图服务',
      actionValue: 'AdminViid',
      actionDesc: '具有视图服务的管理权限',
      autoSelected: 'DescribeViid'
    },
    {
      actionName: '查看AI应用',
      actionValue: 'DescribeAi',
      actionDesc: '拥有AI管理权限',
      actionType: 'GET'
    },
    {
      actionName: '管理AI应用',
      actionValue: 'AdminAi',
      actionDesc: '拥有AI管理权限',
      autoSelected: 'DescribeAi'
    },
    {
      actionName: '查看电子地图',
      actionValue: 'DescribeMap',
      actionDesc: '拥有电子地图的查看权限',
      actionType: 'GET'
    },
    {
      actionName: '查看概览页面',
      actionValue: 'DescribeDashboard',
      actionDesc: '拥有概览页面的查看权限',
      actionType: 'GET'
    },
    {
      actionName: '车辆管理',
      actionValue: 'AdminCar',
      actionDesc: '拥有车辆管理权限'
    }
  ]
}

export default settings
