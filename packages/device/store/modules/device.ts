/**
 * 需将在主工程中引用当前vuex store
 */
import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@vss/device/store'

export interface IDeviceState {
  device?: any
  breadcrumb?: any
  isSorted?: boolean
  industryList?: any
  networkList?: any
}

@Module({ dynamic: true, store, name: 'device' })
export class Device extends VuexModule implements IDeviceState {
  public device: any = null
  public breadcrumb: any = null
  public isSorted = false
  public industryList: Array<any> = null
  public networkList: Array<any> = null

  /**
   * 更新设备详情
   */
  @Mutation
  public SET_DEVICE(device) {
    this.device = device
  }

  /**
   * 更新行业信息列表
   */
  @Mutation
  public SET_INDUSTRY_LIST(industryList) {
    this.industryList = industryList
  }

  /**
   * 更新网络标识列表
   */
  @Mutation
  public SET_NETWORK_LIST(networkList) {
    this.networkList = networkList
  }

  /**
   * 获取设备详情单例，如果已获取过则不再请求
   * 如果设备ID与当前存的不一致，则重新请求
   * @returns device
   */
  @Action
  public async getDevice(payload: { deviceId: string, fetch: Function }) {
    try {
      if (!this.device || this.device.deviceId !== payload.deviceId) {
        let device
        if (payload.fetch) {
          console.log(fetch, payload.deviceId)
          const res = await payload.fetch({
            deviceId: payload.deviceId
          })
          device = res
        }
        this.SET_DEVICE(device)
      }
      return this.device
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取行业列表
   * @returns industryList
   */
  @Action
  public async getIndutryList(method) {
    try {
      if (!this.industryList) {
        const res = await method()
        this.SET_INDUSTRY_LIST(res.data)
      }
      return this.industryList
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取网络标识列表
   * @returns networkList
   */
  @Action
  public async getNetworkList(method) {
    try {
      if (!this.networkList) {
        const res = await method()
        this.SET_NETWORK_LIST(res.data)
      }
      return this.networkList
    } catch (e) {
      console.log(e)
    }
  }
}

export const DeviceModule = getModule(Device)
