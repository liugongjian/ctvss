import { Component, Vue, Prop } from 'vue-property-decorator'
import { DeviceModule } from '@vss/device/store/modules/device'
import { Device } from '@vss/device/type/Device'

@Component
export default class DeviceMixin extends Vue {
  @Prop({
    default: null
  })
  public getDeviceApi: Function
  // 设备详情
  public device: Device = {} as Device
  // 设备详情加载状态
  public deviceLoading = false

  /**
   * 设备ID
   */
  public get deviceId() {
    return this.$route.query.deviceId && this.$route.query.deviceId.toString()
  }

  // 是否含视频
  private get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 是否含视图库
  private get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  /**
   * 获取设备详情
   */
  public async getDevice(deviceId: string = this.deviceId) {
    try {
      this.deviceLoading = true
      this.device = await DeviceModule.getDevice({
        deviceId,
        fetch: this.getDeviceApi
      })
    } catch (e) {
      this.$alertError(e)
    } finally {
      this.deviceLoading = false
    }
  }
}
