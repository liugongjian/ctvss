import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@/store'

export interface IDeviceState {
  breadcrumb?: any
  isSorted?: boolean
}

@Module({ dynamic: true, store, name: 'device' })
class Device extends VuexModule implements IDeviceState {
  public breadcrumb: any = null
  isSorted: boolean = false

  @Mutation
  public SET_BREADCRUMB(payload: any) {
    this.breadcrumb = payload
  }

  @Action
  public SetBreadcrumb(payload: any) {
    this.SET_BREADCRUMB(payload)
  }

  @Action
  public ResetBreadcrumb() {
    this.SET_BREADCRUMB('')
  }

  @Mutation
  public SET_ISSORTED(payload: any) {
    this.isSorted = payload
  }

  @Action
  public SetIsSorted(payload: any) {
    this.SET_ISSORTED(payload)
  }

  @Action
  public ResetIsSorted() {
    this.SET_ISSORTED(false)
  }
}

export const DeviceModule = getModule(Device)
