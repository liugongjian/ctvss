import { Component, Vue, Provide } from 'vue-property-decorator'
import { deleteDevice } from '@/api/ibox'
@Component
export default class HandleMixin extends Vue {
  @Provide('handleTools')
  public async handleTools(type: string, payload: any) {
    console.log('handleTools--->', type, '--------', payload)

    switch (type) {
      case 'goBack':
        // await this.getDirList()
        this.goBack()
        break
      case 'deleteDevice':
        return this.deleteIboxDevice(payload)
      case 'refreshDirectory':
        await this.getDirList()
        this.goBack()
        break
      default: return this.goBack()
    }
  }

  public goBack: Function // 会被子类改写

  public getDirList: Function // 会被子类改写

  public async deleteIboxDevice(device: any) {
    this.$alertDelete({
      type: '设备',
      msg: `删除操作不能恢复，确认删除设备"${device.deviceName}"吗？`,
      method: deleteDevice,
      payload: {
        deviceId: device.deviceId,
        inProtocol: device.inProtocol
      },
      onSuccess: async() => {
        await this.getDirList()
        this.goBack()
      }
    })
  }
}
