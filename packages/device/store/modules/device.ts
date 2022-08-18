import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@vss/device/store'
import { deviceMock } from '@vss/device/mock/device'

export interface IDeviceState {
  device?: any
  breadcrumb?: any
  isSorted?: boolean
}

@Module({ dynamic: true, store, name: 'device' })
export class Device extends VuexModule implements IDeviceState {
  public device: any = null
  public breadcrumb: any = null
  public isSorted: boolean = false

  /**
   * 更新设备详情
   */
  @Mutation
  public SET_DEVICE(device) {
    this.device = device
  }

  /**
   * 获取设备详情单例，如果已获取过则不再请求
   * 如果设备ID与当前存的不一致，则重新请求
   * @returns device
   */
  @Action
  public async getDevice(deviceId) {
    if (!this.device || this.device.deviceId !== deviceId) {
      this.SET_DEVICE(deviceMock)
    }
    return this.device
  }
}

export const DeviceModule = getModule(Device)
