import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { login, logout, getUserInfo } from '@/api/users'
import { getToken, setToken, removeToken, setUsername, getUsername, removeUsername } from '@/utils/cookies'
import router, { resetRouter } from '@/router'
import { PermissionModule } from './permission'
import { TagsViewModule } from './tags-view'
import store from '@/store'

export interface IUserState {
  token: string
  name: string
  avatar: string
  introduction: string
  roles: string[]
  email: string
  type: string
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  public token = getToken() || ''
  public name = ''
  public avatar = ''
  public introduction = ''
  public roles: string[] = []
  public email = ''
  public type = ''

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
  }

  @Mutation
  private SET_NAME(name: string) {
    this.name = name
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

  @Action({ rawError: true })
  public async Login(userInfo: { userName: string, password: string}) {
    let { userName, password } = userInfo
    userName = userName.trim()
    try {
      const data: any = await login({ userName, password })
      setToken(data.token)
      this.SET_TOKEN(data.token)
      // TODO 泰州专属
      // setUsername(userName)
      // this.SET_NAME(userName)
    } catch (e) {
      throw Error(e)
    }
  }

  @Action
  public ResetToken() {
    removeToken()
    removeUsername()
    this.SET_TOKEN('')
    this.SET_NAME('')
    this.SET_ROLES([])
  }

  @Action
  public async GetUserInfo() {
    if (this.token === '') {
      throw Error('GetUserInfo: token is undefined!')
    }
    const data: any = await getUserInfo()
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }
    const { userName } = data
    const roles = ['admin']
    const introduction = '欢迎光临'
    const email = 'vss@chinatelecom.cn'
    const type = userName === 'tywl' ? 'kanjia' : 'default' // HARDCODE: 针对天翼看家单独判断

    // roles must be a non-empty array
    if (!roles || roles.length <= 0) {
      throw Error('GetUserInfo: roles must be a non-null array!')
    }
    this.SET_ROLES(roles)
    // const todoUserName: any = getUsername()
    // this.SET_NAME(todoUserName)
    setUsername(userName)
    this.SET_NAME(userName)
    // this.SET_NAME(userName)
    // this.SET_AVATAR(avatar)
    this.SET_INTRODUCTION(introduction)
    this.SET_EMAIL(email)
    this.SET_TYPE(type)
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

  @Action
  public async LogOut() {
    if (this.token === '') {
      throw Error('LogOut: token is undefined!')
    }
    await logout()
    removeToken()
    resetRouter()

    // Reset visited views and cached views
    TagsViewModule.delAllViews()
    this.SET_TOKEN('')
    this.SET_ROLES([])
  }
}

export const UserModule = getModule(User)
