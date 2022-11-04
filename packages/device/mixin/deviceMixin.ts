import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { DeviceModule } from '@vss/device/store/modules/device'
import { Device } from '@vss/device/type/Device'
import { getDevice } from '@vss/device/api/device'
import { DeviceEnum, DeviceTypeEnum } from '../enums/index'

@Component
export default class DeviceMixin extends Vue {
  @Prop({ default: () => getDevice }) public getDeviceApi: () => Promise<any>
  @Prop({ default: false }) public isIbox: boolean

  // 设备详情
  public device: Device = {} as Device

  // 设备详情加载状态
  public deviceLoading = false

  // 设备ID
  public get deviceId() {
    return this.$route.query.deviceId && this.$route.query.deviceId.toString()
  }

  // 设备类型
  public get deviceType() {
    return this.device.device && this.device.device.deviceType
  }

  // 是否含视频
  public get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 是否含视图库
  public get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  // 协议类型
  public get inProtocol() {
    if (this.hasVideo) {
      return this.device.videos[0][DeviceEnum.InVideoProtocol]
    } else if (this.hasViid) {
      return this.device.viids[0][DeviceEnum.InViidProtocol]
    }
    return null
  }

  @Watch('$route.query.deviceId', {
    immediate: true
  })
  private async deviceIdChange(deviceId) {
    [DeviceTypeEnum.Ipc].includes(this.deviceType) && this.getDevice(deviceId)
  }

  /**
   * 获取设备详情
   */
  public async getDevice(deviceId: string = this.deviceId, isForce = false) {
    try {
      this.deviceLoading = true
      this.device = await DeviceModule.getDevice({
        deviceId,
        isForce,
        fetch: this.getDeviceApi
      }) || {}
    } catch (e) {
      this.$alertError(e)
    } finally {
      this.deviceLoading = false
    }
  }

  /**
   * 清空设备详情
   */
  public async clearDevice() {
    DeviceModule.clearDevice()
  }
}
