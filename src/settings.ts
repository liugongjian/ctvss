interface ISettings {
  title: string // Overrides the default title
  showSettings: boolean // Controls settings panel display
  showTagsView: boolean // Controls tagsview display
  showSidebarLogo: boolean // Controls siderbar logo display
  fixedHeader: boolean // If true, will fix the header component
  errorLog: string[] // The env to enable the errorlog component, default 'production' only
  sidebarTextTheme: boolean // If true, will change active text color for sidebar based on theme
  devServerPort: number // Port number for webpack-dev-server
  mockServerPort: number // Port number for mock server
  casLoginUrl: string // 单点登录中台路径
  mainLoginUrl: string // 主账号登录路径
  subLoginUrl: string // 子账号登录路径
  projectPrefix: string // 项目前缀路径
  outNetworkWhiteList: Array<string> // 公网白名单
}

// You can customize below settings :)
const settings: ISettings = {
  title: '天翼云视频云网平台-客户控制台',
  showSettings: true,
  showTagsView: true,
  fixedHeader: false,
  showSidebarLogo: false,
  errorLog: ['production'],
  sidebarTextTheme: true,
  devServerPort: 9527,
  mockServerPort: 9528,
  casLoginUrl: '/v1/cas/callback',
  mainLoginUrl: '/login',
  subLoginUrl: '/login/subAccount',
  projectPrefix: '/vss',
  outNetworkWhiteList: [
    '182.43.127.35',
    'console.vcn.ctyun.cn'
  ]
}

export default settings
