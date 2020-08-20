import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { Group } from '@/type/group'
import store from '@/store'

export interface IDeviceState {
  breadcrumb?: any
  group?: Group,
}

@Module({ dynamic: true, store, name: 'device' })
class Device extends VuexModule implements IDeviceState {
  public breadcrumb: any = null
  public group: Group = {
    groupName: ''
  }

  @Mutation
  public SET_BREADCRUMB(payload: any) {
    this.breadcrumb = payload
  }

  @Mutation
  public SET_GROUP(payload: any) {
    this.group = payload
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
  public SetGroup(payload: any) {
    this.SET_GROUP(payload)
  }
}

export const DeviceModule = getModule(Device)
