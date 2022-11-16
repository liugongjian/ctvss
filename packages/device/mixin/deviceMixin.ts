import { Component, Vue, Prop } from 'vue-property-decorator'
import { DeviceModule } from '@vss/device/store/modules/device'
import { Device } from '@vss/device/type/Device'
import { getDevice } from '@vss/device/api/device'
import { getDir } from '@vss/device/api/dir'
import { DeviceEnum, DeviceTypeEnum, DirectoryTypeEnum } from '../enums/index'

@Component
export default class DeviceMixin extends Vue {
  @Prop({ default: () => getDevice }) public getDeviceApi: () => Promise<any>
  @Prop({ default: false }) public isIbox: boolean


  // 如果无法从路由获取deviceId
  public deviceIdSecondary

  // 设备详情
  public device: Device = {} as Device

  // 目录详情
  public dir: any = {}

  // 设备详情加载状态
  public deviceLoading = false

  // 设备ID
  public get deviceId() {
    return this.$route.query.deviceId && this.$route.query.deviceId.toString()
  }

  // 设备类型
  public get deviceType() {
    return this.$route.query.type as DeviceTypeEnum | DirectoryTypeEnum || this.device.device && this.device.device.deviceType as DeviceTypeEnum
  }

  // 是否含视频
  public get hasVideo() {
    return this.device.videos && this.device.videos.length
  }

  // 是否含视图库
  public get hasViid() {
    return this.device.viids && this.device.viids.length
  }

  // 设备或目录来源
  public get deviceFrom() {
    if (this.deviceType === DirectoryTypeEnum.Dir) {
      return this.dir.dirFrom
    } else {
      return this.device.device && this.device.device.deviceFrom
    }
  }

  // 设备或目录是否为角色共享提供的
  public get isRoleShared() {
    if (this.deviceType === DirectoryTypeEnum.Dir) {
      return this.dir.isRoleShared
    } else {
      return this.device.device && this.device.device.isRoleShared
    }
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

  /**
   * 获取设备详情
   */
  public async getDevice(deviceId: string = this.deviceId || this.deviceIdSecondary, isForce = false, hasLoading = true) {
    try {
      if (hasLoading) {
        this.deviceLoading = true
      }
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
   * 获取设备详情
   */
   public async getDir(dirId: string) {
    try {
      this.dir = await getDir({
        dirId
      }) || {}
      console.log(this.dir)
    } catch (e) {
      this.$alertError(e)
    }
  }

  /**
   * 清空设备详情
   */
  public async clearDevice() {
    DeviceModule.clearDevice()
  }
}
