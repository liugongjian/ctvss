import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { login, logout, getMainUserInfo, getIAMUserInfo, changePassword } from '@/api/users'
import { getToken, setToken, removeToken, getUsername, setUsername, removeUsername, getIamUserId, setIamUserId, removeIamUserId } from '@/utils/cookies'
import router, { resetRouter } from '@/router'
import { PermissionModule } from './permission'
import { TagsViewModule } from './tags-view'
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
  mainUserAddress: string
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
  public email = ''
  public type = ''
  public mainUserID = ''
  public mainUserAddress = ''

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

  @Action({ rawError: true })
  public async Login(userInfo: { mainUserID?: string, userName: string, password: string}) {
    let { mainUserID, userName, password } = userInfo
    userName = userName.trim()
    try {
      const data: any = await login({
        mainUserID: mainUserID || undefined,
        userName,
        password
      })
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
      // this.SET_AVATAR(avatar)
    } catch (e) {
      throw Error(e)
    }
  }

  @Action
  public ResetToken() {
    removeToken()
    removeUsername()
    removeIamUserId()
    this.SET_TOKEN('')
    this.SET_NAME('')
    this.SET_PERMS([])
    this.SET_IAM_USER_ID('')
    this.SET_MAIN_USER_ADDRESS('')
    this.SET_MAIN_USER_ID('')
  }

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
    let userInfo: any = await getMainUserInfo()
    console.log('userInfo: ', userInfo)
    if (userInfo.userId) {
      this.SET_MAIN_USER_ID(userInfo.userId)
      this.SET_MAIN_USER_ADDRESS(userInfo.userAddress)
    }
    let data: any = null
    if (this.iamUserId) {
      data = await getIAMUserInfo({ iamUserId: this.iamUserId })
      const policy = JSON.parse(data.policyDocument || '{}')
      try {
        const actionStr = policy.Statement[0].Action[0].split(':')[1]
        console.log('actionStr: ', actionStr)
        if (actionStr === 'Get*') {
          data.perms = ['GET']
        } else {
          data.perms = ['*']
        }
      } catch (e) {
        data = {
          perms: ['*']
        }
      }
    } else {
      data = {
        perms: ['*']
      }
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
  }

  @Action
  public async ChangeRoles(role: string) {
    // Dynamically modify permissions
    const token = role + '-token'
    this.SET_TOKEN(token)
    setToken(token)
    await this.GetUserInfo()
    resetRouter()
    // Generate dynamic accessible routes based on roles
    PermissionModule.GenerateRoutes(this.roles)
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

  @Action
  public async LogOut() {
    if (this.token === '') {
      throw Error('LogOut: token is undefined!')
    }
    await logout()
    removeToken()
    resetRouter()
    removeUsername()

    // Reset visited views and cached views
    TagsViewModule.delAllViews()
    this.SET_TOKEN('')
    this.SET_ROLES([])
    this.SET_PERMS([])
    this.SET_NAME('')

    const result = {
      mainUserID: this.mainUserID,
      iamUserId: this.iamUserId
    }
    removeIamUserId()
    this.SET_IAM_USER_ID('')

    this.SET_MAIN_USER_ID('')
    this.SET_MAIN_USER_ADDRESS('')
    return result
  }
}

export const UserModule = getModule(User)
