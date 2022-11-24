import { Component, Vue, Provide } from 'vue-property-decorator'
import { deleteDevice, getDeviceList, startDevice, stopDevice, getDeviceDetail } from '@/api/ibox'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'

@Component
export default class HandleMixin extends Vue {
  public goback: Function // 会被子类改写
  public getDirList: Function // 会被子类改写

  public count: number = 0 // 轮训上限次数
  public times: number = 5 // 轮训间隔

  public pager = {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }

  public tableData = []

  @Provide('handleTools')
  public async handleTools(type: string, payload: any, inProtocol: string) {
    console.log('handleTools--->', type, '--------', payload, inProtocol)

    switch (type) {
      case 'goBack':
        this.goback()
        break
      case 'deleteDevice':
        return this.deleteIboxDevice(payload)
      case 'refreshDirectory':
        await this.getDirList()
        this.goback()
        break
      case 'startDevice':
        this.startDevice(payload, inProtocol)
        break
      case 'stopDevice':
        this.stopDevice(payload, inProtocol)
        break
      case 'startRecord':
        break
      case 'refreshRouterView':
        (this.$router as any).replace({
          query: {
            ...this.$route.query,
            refreshFlag: payload
          }
        })
        break
      default: return this.goback()
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
      onSuccess: async() => {
        await this.getDirList()
        this.goback()
      }
    })
  }

  @Provide('getIboxDeviceList')
  public async getIboxDeviceList() {
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
            ...item.videos[0],
            ...item
          }
        })
        console.log('this.tableData--->', this.tableData)
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

  public async startDevice(row: any, inProtocol: string) {
    const { deviceId } = row
    const param = {
      deviceId,
      inProtocol
    }
    try {
      await startDevice(param)
      this.$message.success('已通知启用流，请耐心等待流启用成功')
      this.count = 0
      const query = {
        deviceId,
        status: 'on'
      }
      this.syncDeviceStream(query)
    } catch (error) {
      console.log(error)
    }
  }

  public async stopDevice(row: any, inProtocol: string) {
    const { deviceId } = row
    const param = {
      deviceId,
      inProtocol
    }
    try {
      await stopDevice(param)
      this.$message.success('已通知停用流，请耐心等待流停用成功')
      this.count = 0
      const query = {
        deviceId,
        status: 'off'
      }
      this.syncDeviceStream(query)
    } catch (error) {
      console.log(error)
    }
  }

  public syncDeviceStream(query: any) {
    this.streamPolling(query).then(({ streamStatus, status }) => {
      if (streamStatus !== status) {
        this.getDirList()
        this.getIboxDeviceList()
      }
    })
  }

  public streamPolling(query: any) {
    if (this.count < 6) {
      this.count = this.count + 1
      const { deviceId, status } = query
      const param = { deviceId }
      return new Promise((resolve, reject) => {
        getDeviceDetail(param).then((res: any) => {
          const videos = res.videos[0]
          const videosInfo = videos[InVideoProtocolModelMapping[videos.inVideoProtocol]]
          if (videosInfo?.streams[0]?.streamStatus !== status) {
            setTimeout(() => {
              resolve(this.streamPolling(query))
            }, this.times * 1000)
          } else {
            const result = { streamStatus: videosInfo?.streams[0]?.streamStatus, status }
            resolve(result)
          }
        }).catch(err => reject(err))
      })
    } else {
      this.count = 6
    }
  }
}
