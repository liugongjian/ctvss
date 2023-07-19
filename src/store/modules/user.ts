import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { encrypt } from '@/utils/encrypt'
import { login, logout, getMainUserInfo, getIAMUserInfo, getIAMUserMergedPolicies, changePassword, resetIAMPassword, getUserConfig } from '@/api/users'
import { getToken, setToken, removeToken, getUsername, setUsername, removeUsername, getIamUserId, setIamUserId, removeIamUserId } from '@/utils/cookies'
import { setLocalStorage, getLocalStorage } from '@/utils/storage'
import { resetRouter } from '@/router'
import { GroupModule } from './group'
import { TagsViewModule } from './tags-view'
import { DeviceModule } from '@/store/modules/device'
import { VGroupModule } from '@/store/modules/vgroup'
import settings from '@/settings'
import store from '@/store'

export interface IUserState {
  token: string
  name: string
  perms: string[]
  iamUserId: string
  type: string
  mainUserID: string
  mainUserAddress: string
  tags: any
  casLoginId: string
  settings: any
  version: number
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  public token = getToken() || ''
  public name = getUsername() || ''
  public iamUserId = getIamUserId() || ''
  public perms: string[] = []
  public resources: string[] = []
  public resourcesSet: Set<any> = new Set()
  public type = ''
  public mainUserID = ''
  public mainUserAddress = ''
  public tags: any = null
  public casLoginId = getLocalStorage('casLoginId') || ''
  public settings: any = {
    screenCache: {}
  }
  public userConfigInfo: any = []
  public outNetwork: 'internet' | 'vpn' = 'internet'
  public isPrivate = false
  public version = 2

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
  private SET_VERSION(version: number) {
    this.version = version
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
  private SET_CAS_LOGIN_ID(casLoginId: string) {
    this.casLoginId = casLoginId
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

  @Mutation
  private SET_IS_PRIVATE(isPrivate: boolean) {
    this.isPrivate = isPrivate
  }

  @Action({ rawError: true })
  public async Login(userInfo: { mainUserID?: string, userName: string, password: string, captchaId: string, captcha: string }) {
    let { mainUserID, userName, password, captchaId, captcha } = userInfo
    userName = userName.trim()
    const data: any = await login({
      mainUserID: mainUserID || undefined,
      userName: encrypt(userName),
      password: encrypt(password),
      captchaId,
      captcha,
      platform: 'web',
      version: '2.0'
    })

    setLocalStorage('loginType', mainUserID ? 'sub' : 'main')
    setToken(data.token)
    setUsername(userName)
    setIamUserId(data.iamUserId)
    this.SET_TOKEN(data.token)
    this.SET_NAME(userName)
    const type = userName === 'tywl' ? 'kanjia' : 'default' // HARDCODE: 针对天翼看家单独判断
    this.SET_TYPE(type)
    this.SET_IAM_USER_ID(data.iamUserId)
    GroupModule.ResetGroupListIndex()
    return data
  }
  // 获取用户配置信息
  @Action({ rawError: true })
  public async getUserConfigInfo() {
    // 前后端参数不一致，设置转换字典
    const dic = {
      live: 'screen',
      record: 'replay'
    }
    try {
      const defaultConfig = {
        screen: 'false',
        replay: 'false'
      }

      const res = await getUserConfig()
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
  public async SetCASLoginId(loginId: string) {
    setLocalStorage('casLoginId', loginId)
    this.SET_CAS_LOGIN_ID(loginId)
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
    this.SET_VERSION(2)
    this.SetCASLoginId('')
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
    // if (!getLocalStorage('screenCache')) {
    //   const screenCache = {
    //     mainUserID: null,
    //     currentGroupId: null,
    //     screen: {
    //       screenList: [],
    //       screenSize: '4'
    //     },
    //     replay: {
    //       screenList: [],
    //       screenSize: '1'
    //     }
    //   }
    //   setLocalStorage('screenCache', screenCache)
    // }
  }

  @Action({ rawError: true })
  public async GetGlobalInfo() {
    if (this.token === '') {
      throw Error('GetGlobalInfo: token is undefined!')
    }

    if (process.env.NODE_ENV === 'development' || settings.outNetworkWhiteList.indexOf(location.hostname) !== -1) {
      this.SET_OUTER_NETWORK('internet')
    } else {
      this.SET_OUTER_NETWORK('vpn')
    }

    const userInfo: any = await getMainUserInfo()
    if (userInfo.userId) {
      this.SET_MAIN_USER_ID(userInfo.userId)
      this.SET_MAIN_USER_ADDRESS(userInfo.address)
      this.SET_MAIN_USER_TAGS(userInfo.tags)
      // this.SET_MAIN_USER_TAGS({ ...userInfo.tags, isCarShow: 'false' })
      // this.SET_MAIN_USER_TAGS({ ...userInfo.tags, 'isIndustrialDetection': 'Y' })
      // this.SET_MAIN_USER_TAGS({ ...userInfo.tags, isLianZhouEdu: 'Y' })
      // this.SET_MAIN_USER_TAGS({ ...userInfo.tags, isRecordLockAvailable: 'Y' })   // 录像锁定 ---  本地测试用
      this.SET_VERSION(userInfo.overrideApiVersion === 'v2' ? 2 : 1)
    }

    // 设置视频记录保存配置项
    this.getUserConfigInfo()

    let data: any = null
    if (this.iamUserId) {
      data = await getIAMUserInfo({ iamUserId: this.iamUserId })
      this.SET_NAME(data.iamUserName)
      setUsername(data.iamUserName)

      const mergedPolicy: any = await getIAMUserMergedPolicies()
      const policy = JSON.parse(mergedPolicy.policyDocument || '{}')
      try {
        const allowStatments = policy.Statement.filter((statement: any) => statement.Effect === 'Allow')
        const tempActionList = allowStatments.reduce((pre, cur) => {
          return pre.concat(cur.Action)
        }, [])

        const actionList = [...new Set(tempActionList)]
        const resourceList = policy.Statement[0].Resource
        if (actionList.includes('ivs:*')) {
          data.perms = ['*']
          data.resource = ['*']
        } else if (actionList.includes('ivs:Get*')) {
          const getActions = settings.systemActionList.filter((row: any) => row.actionType === 'GET').map((row: any) => row.actionKey)
          data.perms = [...new Set(actionList.filter(action => action !== 'ivs:Get*').concat(getActions))]
          console.log('data.perms: ', data.perms)
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
          perms: [],
          resource: [],
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
      this.SET_IS_PRIVATE(userInfo.isPrivate)
      setUsername(userInfo.userName)
    }
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }
    const perms = data.perms
    // perms must be a non-empty array
    // if (!perms || perms.length <= 0) {
    //   throw Error('GetGlobalInfo: perms must be a non-null array!')
    // }
    this.SET_PERMS(perms)
    this.SET_RESOURCES(data)
  }

  @Action({ rawError: true })
  public async ChangePassword(form: { originalPwd: string, newPwd: string }) {
    const { originalPwd, newPwd } = form
    await changePassword({
      oldPassword: encrypt(originalPwd),
      newPassword: encrypt(newPwd),
      version: '2.0'
    })
  }

  @Action({ rawError: true })
  public async ResetIAMPassword(form: { mainUserID: string, subUserName: string, originalPwd: string, newPwd: string }) {
    const { mainUserID, subUserName, originalPwd, newPwd } = form
    const data = await resetIAMPassword({
      mainUserID,
      subUserName: encrypt(subUserName),
      oldPassword: encrypt(originalPwd),
      newPassword: encrypt(newPwd),
      version: '2.0'
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
    this.SET_TOKEN('')
    this.SET_PERMS([])
    this.SET_RESOURCES({ resources: [], resourcesSet: new Set() })
    this.SET_NAME('')
    this.SET_VERSION(2)

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
