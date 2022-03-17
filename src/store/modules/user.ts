import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { Base64 } from 'js-base64'
import { login, logout, getMainUserInfo, getIAMUserInfo, changePassword, resetIAMPassword, getUserConfig } from '@/api/users'
import { switchUserRole, exitUserRole } from '@/api/accessManage'
import { getToken, setToken, removeToken, getUsername, setUsername, removeUsername, getIamUserId, setIamUserId, removeIamUserId } from '@/utils/cookies'
import { setLocalStorage, getLocalStorage } from '@/utils/storage'
import router, { resetRouter } from '@/router'
import { PermissionModule } from './permission'
import { GroupModule } from './group'
import { TagsViewModule } from './tags-view'
import { DeviceModule } from '@/store/modules/device'
import { VGroupModule } from '@/store/modules/vgroup'
import store from '@/store'
export interface IUserState {
  token: string
  name: string
  avatar: string
  introduction: string
  roles: string[],
  perms: string[],
  iamUserId: string,
  email: string,
  type: string,
  mainUserID: string,
  mainUserAddress: string,
  tags: any,
  ctLoginId: string
  settings: any
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  public token = getToken() || ''
  public name = getUsername() || ''
  public avatar = ''
  public introduction = ''
  public iamUserId = getIamUserId() || ''
  public roles: string[] = []
  public perms: string[] = []
  public resources: string[] = []
  public resourcesSet: Set<any> = new Set()
  public email = ''
  public type = ''
  public mainUserID = ''
  public mainUserAddress = ''
  public tags: any = null
  public ctLoginId = getLocalStorage('ctLoginId') || ''
  public whiteListFlag = getLocalStorage('whiteListFlag') || ''
  public settings: any = {
    screenCache: {}
  }
  public userConfigInfo: any = []
  public outNetwork: 'internet' | 'vpn' = 'internet'

  @Mutation
  private SET_WHITELIST(flag: string) {
    this.whiteListFlag = flag
  }

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
  }

  @Mutation
  private SET_NAME(name: string) {
    this.name = name
  }

  @Mutation
  private SET_IAM_USER_ID(id: string) {
    this.iamUserId = id
  }

  @Mutation
  private SET_AVATAR(avatar: string) {
    this.avatar = avatar
  }

  @Mutation
  private SET_INTRODUCTION(introduction: string) {
    this.introduction = introduction
  }

  @Mutation
  private SET_PERMS(perms: string[]) {
    this.perms = perms
  }

  @Mutation
  private SET_RESOURCES(data: any) {
    this.resources = data.resources
    this.resourcesSet = data.resourcesSet
  }

  @Mutation
  private SET_ROLES(roles: string[]) {
    this.roles = roles
  }

  @Mutation
  private SET_EMAIL(email: string) {
    this.email = email
  }

  @Mutation
  private SET_TYPE(type: string) {
    this.type = type
  }

  @Mutation
  private SET_MAIN_USER_ID(id: string) {
    this.mainUserID = id
  }

  @Mutation
  private SET_MAIN_USER_ADDRESS(address: string) {
    this.mainUserAddress = address
  }

  @Mutation
  private SET_MAIN_USER_TAGS(tags: any) {
    this.tags = tags
  }

  @Mutation
  private SET_CT_LOGIN_ID(ctLoginId: string) {
    this.ctLoginId = ctLoginId
  }

  @Mutation
  private SET_SETTINGS(settings: any) {
    this.settings = settings
    setLocalStorage('settings', JSON.stringify(settings))
  }

  @Mutation
  private SET_USER_CONFIG(userConfig: any) {
    this.userConfigInfo = userConfig
  }

  @Mutation
  private SET_OUTER_NETWORK(outNetwork: 'internet' | 'vpn') {
    this.outNetwork = outNetwork
  }

  @Action({ rawError: true })
  public async Login(userInfo: { mainUserID?: string, userName: string, password: string }) {
    let { mainUserID, userName, password } = userInfo
    userName = userName.trim()
    const data: any = await login({
      mainUserID: mainUserID || undefined,
      userName,
      password: 'YWJjZG' + Base64.encode(password) + 'VmZWRl'
    })
    setLocalStorage('loginType', mainUserID ? 'sub' : 'main')
    setToken(data.token)
    setUsername(userName)
    setIamUserId(data.iamUserId)
    this.SET_TOKEN(data.token)
    this.SET_NAME(userName)
    const introduction = '欢迎光临'
    const email = 'vss@chinatelecom.cn'
    const type = userName === 'tywl' ? 'kanjia' : 'default' // HARDCODE: 针对天翼看家单独判断
    this.SET_INTRODUCTION(introduction)
    this.SET_EMAIL(email)
    this.SET_TYPE(type)
    this.SET_IAM_USER_ID(data.iamUserId)
    GroupModule.ResetGroupListIndex()
    // this.SET_AVATAR(avatar)
    return data
  }

  // 获取用户配置信息
  @Action({ rawError: true })
  public async getUserConfigInfo() {
    // 前后端参数不一致，设置转换字典
    let dic = {
      live: 'screen',
      record: 'replay'
    }
    try {
      let defaultConfig = {
        screen: 'false',
        replay: 'false'
      }

      let res = await getUserConfig()
      this.SET_USER_CONFIG(res.userConfig) // 设置vuex属性

      res.userConfig && res.userConfig.forEach(config => {
        defaultConfig[dic[config.key] || config.key] = config.value
      })
      this.SetScreenCacheSettings(defaultConfig)
    } catch (e) {
      console.log(e)
    }
  }

  @Action({ rawError: true })
  public async SetToken(token: string) {
    setToken(token)
    this.SET_TOKEN(token)
  }

  @Action({ rawError: true })
  public async SetWhiteList(flag: string) {
    setLocalStorage('whiteListFlag', flag)
    this.SET_WHITELIST(flag)
  }

  @Action({ rawError: true })
  public async SetCTLoginId(loginId: string) {
    setLocalStorage('ctLoginId', loginId)
    this.SET_CT_LOGIN_ID(loginId)
  }

  @Action
  public ResetToken() {
    localStorage.clear()
    removeToken()
    removeUsername()
    removeIamUserId()
    this.SET_TOKEN('')
    this.SET_NAME('')
    this.SET_PERMS([])
    this.SET_RESOURCES({ resources: [], resourcesSet: new Set() })
    this.SET_IAM_USER_ID('')
    this.SET_MAIN_USER_ADDRESS('')
    this.SET_MAIN_USER_TAGS('')
    this.SET_MAIN_USER_ID('')
    // 清空设备管理面包屑
    DeviceModule.ResetBreadcrumb()
    // 清空虚拟业务组相关信息
    VGroupModule.resetVGroupInfo()
  }

  // 设置视频记录保存配置项
  @Action
  public SetScreenCacheSettings(screenCacheSettings: any) {
    this.SET_SETTINGS({
      ...this.settings,
      screenCache: screenCacheSettings
    })
    if (!getLocalStorage('screenCache')) {
      let screenCache = {
        mainUserID: null,
        currentGroupId: null,
        screen: {
          screenList: [],
          screenSize: '4'
        },
        replay: {
          screenList: [],
          screenSize: '1'
        }
      }
      setLocalStorage('screenCache', screenCache)
    }
  }

  // 该方法已弃用
  @Action
  public async GetUserInfo() {
    if (this.token === '') {
      throw Error('GetUserInfo: token is undefined!')
    }
    const data: any = await getMainUserInfo()
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }
    const roles = ['admin']
    // roles must be a non-empty array
    if (!roles || roles.length <= 0) {
      throw Error('GetUserInfo: roles must be a non-null array!')
    }
    this.SET_ROLES(roles)
  }

  @Action({ rawError: true })
  public async GetGlobalInfo() {
    if (this.token === '') {
      throw Error('GetGlobalInfo: token is undefined!')
    }
    // 设置视频记录保存配置项
    this.getUserConfigInfo()

    // 获取用户的网络访问类型：专线 or 公网
    const outNetworkWhiteList = [
      '182.43.127.35',
      'console.vcn.ctyun.cn'
    ]
    console.log('process.env: ', process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'development' || outNetworkWhiteList.indexOf(location.hostname) !== -1) {
      this.SET_OUTER_NETWORK('internet')
    } else {
      this.SET_OUTER_NETWORK('vpn')
    }

    let userInfo: any = await getMainUserInfo()
    if (userInfo.userId) {
      this.SET_MAIN_USER_ID(userInfo.userId)
      this.SET_MAIN_USER_ADDRESS(userInfo.address)
      this.SET_MAIN_USER_TAGS(userInfo.tags)
    }

    let data: any = null
    if (this.iamUserId) {
      data = await getIAMUserInfo({ iamUserId: this.iamUserId })
      this.SET_NAME(data.iamUserName)
      setUsername(data.iamUserName)
      const policy = JSON.parse(data.policyDocument || '{}')
      try {
        const actionList = policy.Statement[0].Action
        const resourceList = policy.Statement[0].Resource
        if (actionList[0] === 'vss:*') {
          data.perms = ['*']
          data.resource = ['*']
        } else if (actionList[0] === 'vss:Get*') {
          data.perms = ['DescribeGroup', 'DescribeDevice', 'ScreenPreview', 'ReplayRecord']
          data.resource = ['*']
          data.resourcesSet = new Set()
        } else {
          data.perms = actionList
          data.resource = resourceList
          const tempSet = new Set()
          resourceList.forEach((resource: any) => {
            const idArr = resource.split(':').slice(2).join('/').split(/\//).slice(0, -1)
            idArr.forEach((id: any) => tempSet.add(id))
          })
          data.resourcesSet = tempSet
        }
      } catch (e) {
        data = {
          perms: ['*'],
          resource: ['*'],
          resourcesSet: new Set()
        }
      }
    } else {
      data = {
        perms: ['*'],
        resource: ['*'],
        resourcesSet: new Set()
      }
      this.SET_NAME(userInfo.userName)
      setUsername(userInfo.userName)
    }
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }
    const perms = data.perms
    // perms must be a non-empty array
    if (!perms || perms.length <= 0) {
      throw Error('GetGlobalInfo: perms must be a non-null array!')
    }
    this.SET_PERMS(perms)
    this.SET_RESOURCES(data)
  }

  @Action
  public async switchRole(roleInfo: { role: any, needWebRequest: boolean }) {
    if (roleInfo.needWebRequest) {
      if (!roleInfo.role) {
        await exitUserRole()
      } else {
        await switchUserRole({ roleId: roleInfo.role.roleId })
      }
    }
    // 清理 业务组列表 和 当前业务组
    await GroupModule.ResetGroup()
    await GroupModule.ResetGroupList()
    await GroupModule.GetGroupList()

    await this.GetGlobalInfo()
    resetRouter()
    // Generate dynamic accessible routes based on roles
    PermissionModule.GenerateRoutes({ perms: this.perms, iamUserId: this.iamUserId })
    // Add generated routes
    router.addRoutes(PermissionModule.dynamicRoutes)
    // Reset visited views and cached views
    TagsViewModule.delAllViews()
  }

  @Action({ rawError: true })
  public async ChangePassword(form: { originalPwd: string, newPwd: string }) {
    let { originalPwd, newPwd } = form
    await changePassword({
      oldPassword: originalPwd,
      newPassword: newPwd
    })
  }

  @Action({ rawError: true })
  public async ResetIAMPassword(form: { mainUserID: string, subUserName: string, originalPwd: string, newPwd: string }) {
    let { mainUserID, subUserName, originalPwd, newPwd } = form
    const data = await resetIAMPassword({
      mainUserID,
      subUserName,
      oldPassword: originalPwd,
      newPassword: newPwd
    })
    return data
  }

  @Action
  public async LogOut() {
    if (this.token === '') {
      throw Error('LogOut: token is undefined!')
    }
    try {
      await logout()
    } catch (e) {
      console.log('logout e: ', e)
    }
    removeToken()
    resetRouter()
    removeUsername()
    // Reset visited views and cached views
    TagsViewModule.delAllViews()
    // 清空设备管理面包屑
    DeviceModule.ResetBreadcrumb()
    // 清空虚拟业务组相关信息
    VGroupModule.resetVGroupInfo()
    this.SET_WHITELIST('')
    this.SET_TOKEN('')
    this.SET_ROLES([])
    this.SET_PERMS([])
    this.SET_RESOURCES({ resources: [], resourcesSet: new Set() })
    this.SET_NAME('')

    const result = {
      mainUserID: this.mainUserID,
      iamUserId: this.iamUserId
    }
    removeIamUserId()
    this.SET_IAM_USER_ID('')

    this.SET_MAIN_USER_ID('')
    this.SET_MAIN_USER_ADDRESS('')
    this.SET_MAIN_USER_TAGS('')

    localStorage.clear()
    return result
  }
}

export const UserModule = getModule(User)
