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
  apiBaseUrl: string
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
    '182.43.127.36',
    'console.vcn.ctyun.cn',
    'console.vcn.ctcdn.cn'
  ],
  apiBaseUrl: '/v1'
}

export default settings
