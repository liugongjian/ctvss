import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@/store'

export interface IDeviceState {
  breadcrumb: any
}

@Module({ dynamic: true, store, name: 'device' })
class Device extends VuexModule implements IDeviceState {
  public breadcrumb: any = null

  @Mutation
  public SET_BREADCRUMB(payload: any) {
    this.breadcrumb = payload
  }

  @Action
  public SetBreadcrumb(payload: any) {
    this.SET_BREADCRUMB(payload)
  }
}

export const DeviceModule = getModule(Device)
