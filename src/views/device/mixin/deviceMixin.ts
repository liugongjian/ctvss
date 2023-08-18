/**
 * 设备常规操作：删除、启停录像、启停设备、查看详情、查看实时预览
 */
import { Component, Vue, Inject, Provide } from 'vue-property-decorator'
import { Device } from '@/type/Device'
import { deleteDevice, startDevice, stopDevice, startRecord, stopRecord } from '@/api/device'
import MoveDir from '../components/dialogs/MoveDir.vue'

@Component({
  components: {
    MoveDir
  }
})
export default class DeviceMixin extends Vue {
  @Inject('deviceRouter')
  public deviceRouter!: Function
  @Inject('initDirs')
  public initDirs!: Function

  public get inProtocol() {
    return this.$route.query.inProtocol
  }

  /**
   * 初始化
   */
  public init() {}

  /**
   * 删除成功回调
   */
  public onDeleteDevice() {}

  /**
   * 预览
   */
  public goToPreview(previewTab: string, device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: 'preview',
      previewTab
    })
  }

  /**
   * 查看设备详情
   */
  public goToDetail(device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: 'detail'
    })
  }

  /**
   * 编辑设备
   */
  public goToUpdate(device: Device) {
    this.deviceRouter({
      id: device.deviceId,
      type: 'update'
    })
  }

  /**
   * 删除设备
   */
  @Provide('deleteDevice')
  public deleteDevice(device: Device) {
    this.$alertDelete({
      type: '设备',
      msg: `删除操作不能恢复，确认删除设备"${device.deviceName}"吗？`,
      method: deleteDevice,
      payload: {
        deviceId: device.deviceId,
        inProtocol: this.inProtocol,
        parentDeviceId: device.parentDeviceId
      },
      onSuccess: () => {
        this.onDeleteDevice()
        this.initDirs()
      }
    })
  }

  /**
   * 启动设备
   */
  @Provide('startDevice')
  public async startDevice(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId,
        inProtocol: this.inProtocol,
        inType: device.inType,
        streamNum: device.streamNum
      }
      await startDevice(params)
      this.$message.success('已通知启用设备')
      return true
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 停用设备
   */
  @Provide('stopDevice')
  public async stopDevice(device: Device) {
    try {
      const params: any = {
        deviceId: device.deviceId,
        inProtocol: this.inProtocol,
        inType: device.inType,
        streamNum: device.streamNum
      }
      this.$confirm(
        '停用流后，设备流将立即下线，配置的视频录制和AI分析将不再生效，直到流再次上线。是否确认停用流?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).then(async () => {
        try {
          await stopDevice(params)
          this.$message.success('已通知停用设备')
          } catch (e){
            this.$message.error(e && e.message)
          }
      })

      return true
    } catch (e) {
      this.$message.error(e && e.message)
    }
  }

  /**
   * 开始录像
   */
  @Provide('startRecord')
  public async startRecord(device: Device) {
    await this.$confirm(`确认开启${device.deviceName}的云端录像吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async() => {
      try {
        const params: any = {
          deviceId: device.deviceId,
          inProtocol: this.inProtocol
        }
        await startRecord(params)
        this.$message.success('已通知开始录制')
        this.init()
        return true
      } catch (e) {
        this.$message.error(e && e.message)
        console.error(e)
        return false
      }
    })
    return true
  }

  /**
   * 停止录像
   */
  @Provide('stopRecord')
  public async stopRecord(device: Device) {
    await this.$confirm(`确认关闭${device.deviceName}的云端录像吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async() => {
      try {
        const params: any = {
          deviceId: device.deviceId,
          recordTaskId: device.recordTaskId,
          inProtocol: this.inProtocol
        }
        await stopRecord(params)
        this.$message.success('已通知停止录像')
        this.init()
        return true
      } catch (e) {
        this.$message.error(e && e.message)
        console.error(e)
        return false
      }
    })
    return true
  }
}
