/**
 * 需将在主工程中引用当前vuex store
 */
import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@vss/device/store'
import { toLowerCase } from '@vss/base/utils/param'
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
  public async getDevice(payload: { deviceId: string, fetch: Function }) {
    if (!this.device || this.device.deviceId !== payload.deviceId) {
      let device
      if (payload.fetch) {
        const res = await payload.fetch({
          deviceId: payload.deviceId
        })
        device = res
      } else {
        device = toLowerCase(deviceMock)
      }
      this.SET_DEVICE(device)
    }
    return this.device
  }
}

export const DeviceModule = getModule(Device)
