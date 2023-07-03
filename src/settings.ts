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
    actionKey: string;
    actionValueOption?: Array<any>; // 带值action的选项范围
    actionValueDefault?: any; // 带值action勾选后的默认值
    actionDesc: string;
    actionType?: string; // GET权限的用户会默认设置该perm
    allowAutoSelected?: string[]; // 勾选后默认勾选的其他aciton - Allow场景
    denyAutoSelected?: string[]; // 勾选后默认勾选的其他aciton - Deny场景
    resourceType?: string | Array<string>;
    version?: string // Action对应的平台版本
    tags?: string[] | Object; // Action对应的用户tag
  }[]
}

// You can customize below settings :)
const settings: ISettings = {
  title: '智能视图服务',
  showSettings: true,
  showTagsView: true,
  fixedHeader: false,
  showSidebarLogo: false,
  errorLog: ['production'],
  sidebarTextTheme: true,
  projectPrefix: '/vss',
  outNetworkWhiteList: [
    '182.43.127.35',
    '182.43.127.36',
    'console.vcn.ctyun.cn',
    'console.vaas.ctyun.cn',
    'console.vcn.ctcdn.cn'
  ],
  privateDenyPerms: {
    liuzhou: ['ivs:GetMap', 'ivs:GetViid', 'ivs:AdminViid', 'ivs:AdminCar', 'ivs:frontend:AdminBilling', 'ivs:GetApp', 'ivs:frontend:RecordTemplate'],
    yeji: ['ivs:GetMap', 'ivs:GetViid', 'ivs:AdminViid', 'ivs:AdminCar', 'ivs:frontend:AdminAlarm', 'ivs:frontend:AdminNotification', 'ivs:frontend:AdminBilling'],
    hetian: ['ivs:GetMap', 'ivs:GetViid', 'ivs:AdminViid', 'ivs:AdminCar', 'ivs:frontend:AdminNotification']
  },
  systemActionList: [
    // 业务组
    {
      actionName: '查询业务组',
      actionKey: 'ivs:GetGroup',
      actionDesc: '拥有业务组的查询权限，并展示业务组管理菜单',
      actionType: 'GET',
      denyAutoSelected: ['ivs:DeleteGroup', 'ivs:UpdateGroup', 'ivs:CreateGroup', 'ivs:GetDevice'],
      resourceType: '*',
      version: 'v1'
    },
    {
      actionName: '删除业务组',
      actionKey: 'ivs:DeleteGroup',
      actionDesc: '拥有业务组的删除权限，并展示业务组管理菜单',
      allowAutoSelected: ['ivs:GetGroup'],
      resourceType: '*',
      version: 'v1'
    },
    {
      actionName: '修改业务组',
      actionKey: 'ivs:UpdateGroup',
      actionDesc: '拥有业务组的修改权限，并展示业务组管理菜单',
      allowAutoSelected: ['ivs:GetGroup'],
      resourceType: '*',
      version: 'v1'
    },
    // 暂时隐藏
    // {
    //   actionName: '创建业务组',
    //   actionKey: 'ivs:CreateGroup',
    //   allowAutoSelected: ['ivs:GetGroup'],
    //   actionDesc: '拥有业务组的创建权限，并展示业务组管理菜单',
    //   resourceType: '*',
    //   version: 'v1'
    // },
    // 设备管理
    {
      actionName: '查询设备',
      actionKey: 'ivs:GetDevice',
      actionDesc: '拥有设备的查询权限，并展示设备管理菜单',
      actionType: 'GET',
      allowAutoSelected: ['ivs:GetGroup'],
      denyAutoSelected: ['ivs:DeleteDevice', 'ivs:UpdateDevice', 'ivs:CreateDevice', 'ivs:GetLiveStream', 'ivs:GetCloudRecord', 'ivs:GetDeviceRecord', 'ivs:GetApp', 'ivs:GetMap', 'ivs:AdminCar'],
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '删除设备',
      actionKey: 'ivs:DeleteDevice',
      actionDesc: '拥有设备的删除权限，并展示设备管理菜单',
      allowAutoSelected: ['ivs:GetDevice'],
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '修改设备',
      actionKey: 'ivs:UpdateDevice',
      actionDesc: '拥有设备的修改权限，并展示设备管理菜单',
      allowAutoSelected: ['ivs:GetDevice'],
      denyAutoSelected: ['ivs:AdminApp'],
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '创建设备',
      actionKey: 'ivs:CreateDevice',
      actionDesc: '拥有设备的创建权限，并展示设备管理菜单',
      allowAutoSelected: ['ivs:GetDevice'],
      resourceType: ['directory', 'device', 'channel']
    },
    // 实时预览
    {
      actionName: '查询直播流',
      actionKey: 'ivs:GetLiveStream',
      actionDesc: '拥有查询直播流权限，并展示实时预览菜单',
      actionType: 'GET',
      allowAutoSelected: ['ivs:GetDevice'],
      denyAutoSelected: ['ivs:ControlDevicePTZ'],
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '设备云台控制',
      actionKey: 'ivs:ControlDevicePTZ',
      actionValueOption: [1, 10],
      actionValueDefault: 1,
      actionDesc: '拥有设备云台控制权限，并展示实时预览菜单',
      allowAutoSelected: ['ivs:GetLiveStream'],
      denyAutoSelected: ['ivs:LockDevicePTZ', 'ivs:ControlDevicePreset'],
      resourceType: ['directory', 'device', 'channel'],
    },
    {
      actionName: '设备云台锁定',
      actionKey: 'ivs:LockDevicePTZ',
      actionDesc: '拥有设备云台锁定权限，并展示实时预览菜单',
      allowAutoSelected: ['ivs:ControlDevicePTZ'],
      resourceType: ['directory', 'device', 'channel'],
    },
    {
      actionName: '设备预置位配置',
      actionKey: 'ivs:ControlDevicePreset',
      actionDesc: '拥有设备预置位配置权限，并展示实时预览菜单',
      allowAutoSelected: ['ivs:ControlDevicePTZ'],
      resourceType: ['directory', 'device', 'channel']
    },
    // 录像回放
    {
      actionName: '查询云端录像',
      actionKey: 'ivs:GetCloudRecord',
      actionDesc: '拥有云端录像文件的查询权限，并展示录像回放菜单',
      actionType: 'GET',
      allowAutoSelected: ['ivs:GetDevice'],
      denyAutoSelected: ['ivs:DownloadCloudRecord', 'ivs:LockCloudRecord'],
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '查询本地录像',
      actionKey: 'ivs:GetDeviceRecord',
      actionDesc: '拥有设备本地录像文件的查询权限，并展示录像回放菜单',
      allowAutoSelected: ['ivs:GetDevice'],
      actionType: 'GET',
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '下载云端录像',
      actionKey: 'ivs:DownloadCloudRecord',
      actionDesc: '拥有云端录像文件的下载权限，并展示录像回放菜单',
      allowAutoSelected: ['ivs:GetCloudRecord'],
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '锁定云端录像',
      actionKey: 'ivs:LockCloudRecord',
      actionDesc: '拥有云端录像文件的锁定权限，并展示录像回放菜单',
      allowAutoSelected: ['ivs:GetCloudRecord'],
      resourceType: ['directory', 'device', 'channel'],
      tags: {
        'isRecordLockAvailable': ['Y']
      }
    },
    // 视图级联服务(视图级联服务可放入向上级联，作为一种协议进行控制)
    // 柳州上公有云暂时屏蔽（https://dcloud.yuque.com/ctyun/poea5w/kcsd37oaspl3s7gx）
    // {
    //   actionName: '查看视图服务',
    //   actionKey: 'ivs:GetViid',
    //   actionDesc: '具有视图服务菜单',
    //   actionType: 'GET',
    //   denyAutoSelected: ['ivs:AdminViid'],
    //   resourceType: ['directory', 'device', 'channel']
    // },
    // {
    //   actionName: '管理视图服务',
    //   actionKey: 'ivs:AdminViid',
    //   actionDesc: '具有视图服务的管理权限',
    //   allowAutoSelected: ['ivs:GetViid'],
    //   resourceType: ['directory', 'device', 'channel']
    // },
    // 视图分析（原AI功能）
    {
      actionName: '查看AI应用',
      actionKey: 'ivs:GetApp',
      actionDesc: '拥有AI应用的查看权限，并展示AI管理菜单',
      actionType: 'GET',
      allowAutoSelected: ['ivs:GetDevice'],
      denyAutoSelected: ['ivs:AdminApp'],
      resourceType: ['directory', 'device', 'channel']
    },
    {
      actionName: '管理AI应用',
      actionKey: 'ivs:AdminApp',
      actionDesc: '拥有AI应用的管理权限，并展示AI管理菜单',
      allowAutoSelected: ['ivs:GetApp', 'ivs:UpdateDevice'],
      resourceType: ['directory', 'device', 'channel']
    },
    // 电子地图
    {
      actionName: '查看电子地图',
      actionKey: 'ivs:GetMap',
      actionDesc: '拥有电子地图的查看权限，并展示电子地图菜单',
      allowAutoSelected: ['ivs:GetDevice'],
      actionType: 'GET',
      resourceType: '*'
    },
    // 概览页面
    {
      actionName: '查看概览页面',
      actionKey: 'ivs:GetDashboard',
      actionDesc: '拥有概览页面的查看权限',
      actionType: 'GET',
      resourceType: '*'
    },
    // 车载监控管理
    {
      actionName: '车载监控管理',
      actionKey: 'ivs:AdminCar',
      actionDesc: '拥有车载监控管理权限，并展示车载监控管理菜单',
      allowAutoSelected: ['ivs:GetDevice'],
      resourceType: ['directory', 'device', 'channel'],
      tags: {
        'isCarShow': ['true']
      }
    }
    // 电视墙
    // 柳州上公有云暂时屏蔽（https://dcloud.yuque.com/ctyun/poea5w/kcsd37oaspl3s7gx）
    // {
    //   actionName: '电视墙管理',
    //   actionKey: 'ivs:AdminVideoWall',
    //   actionDesc: '拥有电视墙管理权限，并展示电视墙管理菜单',
    //   resourceType: '*'
    // }
  ]
}

export default settings
