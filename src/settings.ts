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
    resourceType?: string | Array<string>;
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
    liuzhou: ['DescribeMap', 'DescribeViid', 'AdminViid', 'AdminCar']
  },
  systemActionList: [
    // 业务组
    {
      actionName: '查询业务组',
      actionValue: 'GetGroup',
      actionDesc: '拥有业务组的查询权限，并展示业务组管理菜单',
      actionType: 'GET', // GET权限的用户会默认设置该perm
      resourceType: '*'
    },
    {
      actionName: '删除业务组',
      actionValue: 'DeleteGroup',
      actionDesc: '拥有业务组的删除权限，并展示业务组管理菜单',
      autoSelected: 'GetGroup', // 勾选后默认勾选的其他aciton
      resourceType: '*'
    },
    {
      actionName: '修改业务组',
      actionValue: 'UpdateGroup',
      actionDesc: '拥有业务组的修改权限，并展示业务组管理菜单',
      autoSelected: 'GetGroup',
      resourceType: '*'
    },
    {
      actionName: '创建业务组',
      actionValue: 'CreateGroup',
      actionDesc: '拥有业务组的创建权限，并展示业务组管理菜单',
      autoSelected: 'GetGroup',
      resourceType: '*'
    },
    // 设备管理
    {
      actionName: '查询设备',
      actionValue: 'GetDevice',
      actionDesc: '拥有设备的查询权限，并展示设备管理菜单',
      actionType: 'GET',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '删除设备',
      actionValue: 'DeleteDevice',
      actionDesc: '拥有设备的删除权限，并展示设备管理菜单',
      autoSelected: 'GetDevice',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '修改设备',
      actionValue: 'UpdateDevice',
      actionDesc: '拥有设备的修改权限，并展示设备管理菜单',
      autoSelected: 'GetDevice',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '创建设备',
      actionValue: 'CreateDevice',
      actionDesc: '拥有设备的创建权限，并展示设备管理菜单',
      autoSelected: 'GetDevice',
      resourceType: ['directory', 'device', 'channel']
    },
    // 实时预览
    {
      actionName: '查询直播流',
      actionValue: 'GetLiveStream',
      actionDesc: '拥有查询直播流权限，并展示实时预览菜单',
      actionType: 'GET',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '设备云台控制',
      actionValue: 'ControlDevicePTZ',
      actionDesc: '拥有设备云台控制权限，并展示实时预览菜单',
      autoSelected: 'GetLiveStream',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '设备云台锁定',
      actionValue: 'LockDevicePTZ',
      actionDesc: '拥有设备云台锁定权限，并展示实时预览菜单',
      autoSelected: 'GetLiveStream',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '设备预置位配置',
      actionValue: 'ControlDevicePreset',
      actionDesc: '拥有设备预置位配置权限，并展示实时预览菜单',
      autoSelected: 'GetLiveStream',
      resourceType: ['directory', 'device', 'channel']
    },
    // 录像回放
    {
      actionName: '查询云端录像',
      actionValue: 'GetCloudRecord',
      actionDesc: '拥有云端录像文件的查询权限，并展示录像回放菜单',
      actionType: 'GET',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '查询本地录像',
      actionValue: 'GetDeviceRecord',
      actionDesc: '拥有设备本地录像文件的查询权限，并展示录像回放菜单',
      actionType: 'GET',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '下载云端录像',
      actionValue: 'DownloadCloudRecord',
      actionDesc: '拥有云端录像文件的下载权限，并展示录像回放菜单',
      autoSelected: 'GetCloudRecord',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '锁定云端录像',
      actionValue: 'LockCloudRecord',
      actionDesc: '拥有云端录像文件的锁定权限，并展示录像回放菜单',
      autoSelected: 'GetCloudRecord',
      resourceType: ['directory', 'device', 'channel']
    },
    // 视图库
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
    // 视图分析（原AI功能）- 视图库功能暂放入向上级联，作为一种协议进行控制
    {
      actionName: '查询行业场景应用',
      actionValue: 'GetApp',
      actionDesc: '拥有查询行业场景应用的权限，并展示视图分析菜单',
      actionType: 'GET'
    },
    {
      actionName: '创建行业场景应用',
      actionValue: 'CreateApp',
      actionDesc: '拥有创建行业场景应用的权限，并展示视图分析菜单',
      autoSelected: 'GetApp'
    },
    // 电子地图
    {
      actionName: '查看电子地图',
      actionValue: 'DescribeMap',
      actionDesc: '拥有电子地图的查看权限，并展示电子地图菜单',
      actionType: 'GET'
    },
    // 概览页面
    {
      actionName: '查看概览页面',
      actionValue: 'DescribeDashboard',
      actionDesc: '拥有概览页面的查看权限',
      actionType: 'GET'
    },
    // 车辆管理
    {
      actionName: '车辆管理',
      actionValue: 'AdminCar',
      actionDesc: '拥有车辆管理权限，并展示车辆管理菜单'
    },
    // 电视墙
    {
      actionName: '电视墙管理',
      actionValue: 'AdminVideoWall',
      actionDesc: '拥有电视墙管理权限，并展示电视墙管理菜单'
    }
  ]
}

export default settings
