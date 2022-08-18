import { Component, Vue } from 'vue-property-decorator'
import { DeviceModule } from '@vss/device/store/modules/device'

@Component
export default class DetailMixin extends Vue {
  // 设备详情
  public device = null
  // 设备详情加载状态
  public deviceLoading = false

  /**
   * 设备ID
   */
  public get deviceId() {
    return this.$route.query.deviceId.toString()
  }

  /**
   * 视频接入协议
   */
  public get inVideoProtocol() {
    return this.device && this.device.videos.length && this.device.videos[0].inVideoProtocol
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
