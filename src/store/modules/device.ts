import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@/store'

export interface IDeviceState {
  breadcrumb?: any
}

@Module({ dynamic: true, store, name: 'device' })
class Device extends VuexModule implements IDeviceState {
  public breadcrumb: any = null
  public screenCache: any = {
    groupId: 0,
    currentIndex: 0,
    maxSize: 0,
    list: []
  }

  @Mutation
  public SET_BREADCRUMB(payload: any) {
    this.breadcrumb = payload
  }

  @Mutation
  public SET_SCREEN_CACHE(payload: any) {
    this.screenCache = payload
  }

  @Action
  public SetBreadcrumb(payload: any) {
    this.SET_BREADCRUMB(payload)
  }

  @Action
  public ResetBreadcrumb() {
    this.SET_BREADCRUMB('')
  }

  @Action
  public SetScreenCache(payload: any) {
    this.SET_SCREEN_CACHE(payload)
  }
}

export const DeviceModule = getModule(Device)
