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
  lastLoadedTimestamp: number
}

@Module({ dynamic: true, store, name: 'device' })
export class Device extends VuexModule implements IDeviceState {
  public device: any = null
  public breadcrumb: any = null
  public isSorted = false
  public industryList: Array<any> = null
  public networkList: Array<any> = null
  // 最后一次加载设备的时间戳
  public lastLoadedTimestamp = 0

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
   * 设置最后一次修改设备的时间戳
   */
  @Mutation
  public SET_LAST_LOADED_TIMESTAMP(lastLoadedTimestamp) {
    this.lastLoadedTimestamp = lastLoadedTimestamp
  }

  /**
   * 获取设备详情单例，如果已获取过则不再请求
   * 如果设备ID与当前存的不一致，则重新请求
   * @returns device
   */
  @Action
  public async getDevice(payload: { deviceId: string, isForce: boolean, fetch: Function }) {
    try {
      // 如果距离最后一次加载时间超过1分钟则重新加载
      const isForce = payload.isForce || new Date().getTime() > (this.lastLoadedTimestamp + 60 * 1000)
      // 如果isForce = true，强制刷新设备详情
      if (isForce || !this.device || this.device.device.deviceId !== payload.deviceId) {
        let device
        if (payload.fetch) {
          const res = await payload.fetch({
            deviceId: payload.deviceId,
            includeDeviceDir: 1,
            includeDeviceStats: 1
          })
          device = res
          this.SET_LAST_LOADED_TIMESTAMP(new Date().getTime())
        }
        this.SET_DEVICE(device)
      }
      return this.device
    } catch (e) {
      this.SET_DEVICE(null)
      console.log(e)
    }
  }

  @Action
  public async clearDevice() {
    this.SET_DEVICE(null)
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
