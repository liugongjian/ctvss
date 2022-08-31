import { Component, Vue } from 'vue-property-decorator'
import { DeviceModule } from '@vss/device/store/modules/device'
import { Device } from '@vss/device/type/Device'
import { DeviceEnum } from '@vss/device/enums'

@Component
export default class DetailMixin extends Vue {
  // 设备详情
  public device: Device = null
  // 设备详情加载状态
  public deviceLoading = false

  /**
   * 设备ID
   */
  public get deviceId() {
    return this.$route.query.deviceId.toString()
  }

  // 是否含视频
  private get hasVideo() {
    return this.device[DeviceEnum.Videos] && this.device[DeviceEnum.Videos].length
  }

  // 是否含视图库
  private get hasViid() {
    return this.device[DeviceEnum.Viids] && this.device[DeviceEnum.Viids].length
  }

  /**
   * 获取设备详情
   */
  public async getDevice() {
    try {
      this.deviceLoading = true
      this.device = await DeviceModule.getDevice(this.deviceId)
    } catch (e) {
      this.$alertError(e)
    } finally {
      this.deviceLoading = false
    }
  }
}
