import { Component, Vue, Inject } from 'vue-property-decorator'
import { getDeviceList, startDevice, stopDevice, deleteDevice } from '@/api/ibox'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'

@Component
export default class ListMixin extends Vue {
  @Inject('getDirList') public getDirList!: Function

  public tableData = []

  public statusMap = {
    on: '在线',
    off: '离线',
    new: '未注册'
  }

  public pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  public addIBox() {
    let query: any = {
      deviceId: this.$route.query.deviceId,
      parentDeviceId: this.$route.query.deviceId,
      type: this.$route.query.type
    }

    const router: any = {
      name: 'IBoxDeviceCreate',
      query
    }
    this.$router.push(router)
  }

  public async getDeviceList() {
    const { query } = (this.$route) as any
    const { deviceId = '' } = query
    const param = {
      pageNum: this.pager.pageNum,
      pageSize: this.pager.pageSize,
      ParentDeviceId: deviceId
    }
    try {
      await getDeviceList(param).then(res => {
        this.tableData = res?.devices.map((item: any) => {
          let videosInfo = item.videos[0]

          videosInfo = videosInfo[InVideoProtocolModelMapping[videosInfo.inVideoProtocol]]

          return {
            ...item.device,
            ...item.industry,
            ...videosInfo,
            ...item
          }
        })
        this.pager = {
          total: Number(res.totalNum),
          pageNum: Number(res.pageNum),
          pageSize: Number(res.pageSize)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  public async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getDeviceList()
  }

  public async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getDeviceList()
  }

  public handleMore(info: any) {
    const { type, device } = info
    switch (type) {
      case 'start':
        this.startDevice(device)
        break
      case 'stop':
        this.stopDevice(device)
        break
      case 'delete':
        this.deleteIboxDevice(device)
        break
    }
  }

  public async deleteIboxDevice(device: any) {
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
        this.getDeviceList()
      }
    })
  }

  public async startDevice(row: any) {
    const { deviceId, videos } = row
    const param = {
      deviceId,
      inProtocol: videos[0].inVideoProtocol
    }
    try {
      await startDevice(param)
    } catch (error) {
      console.log(error)
    }
  }

  public async stopDevice(row: any) {
    const { deviceId, videos } = row
    const param = {
      deviceId,
      inProtocol: videos[0].inVideoProtocol
    }
    try {
      await stopDevice(param)
    } catch (error) {
      console.log(error)
    }
  }
}
