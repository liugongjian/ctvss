import { Component, Vue, Provide, Inject } from 'vue-property-decorator'
import { deleteDevice } from '@/api/ibox'
@Component
export default class HandleMixin extends Vue {
  @Inject('getDirList') public getDirList!: Function
  @Inject('getIboxDeviceList') public getIboxDeviceList!: Function

  @Provide('handleTools')
  public async handleTools(type: string, payload: any) {
    console.log('type--->', type, 'payload---->', payload)
    if (type === 'goBack') {
      this.goBack()
    } else if (type === 'deleteDevice') {
      this.deleteIboxDevice(payload)
    } else {
      this.goBack()
    }
  }

  public goBack() {
    console.log(1222)
  }

  public deleteIboxDevice(device: any) {
    this.$alertDelete({
      type: '设备',
      msg: `删除操作不能恢复，确认删除设备"${device.deviceName}"吗？`,
      method: deleteDevice,
      payload: {
        deviceId: device.deviceId,
        inProtocol: device.inProtocol
      },
      onSuccess: () => {
        this.getDirList()
        this.getIboxDeviceList()
      }
    })
  }
}
