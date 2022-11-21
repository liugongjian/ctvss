import { Component, Provide, Mixins, Inject } from 'vue-property-decorator'
import HandleMixin from './handleMixin'
import { getDeviceList, startDevice, stopDevice, getDeviceDetail } from '@/api/ibox'
import { InVideoProtocolModelMapping } from '@vss/device/dicts'

@Component
export default class ListMixin extends Mixins(HandleMixin) {
  // @ts-ignore
  @Inject('getDirList') public getDirList!: Function
  // @ts-ignore
  // @Inject({ from: 'goback', default: () => {} }) public goback!: Function
  @Inject('goback') public goback!: Function
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

  public count = 0 // 轮训上限次数
  public times = 5 // 轮训间隔

  public addIBox() {
    const query: any = {
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

  public async handleSizeChange(val: number) {
    this.pager.pageSize = val
    await this.getIboxDeviceList()
  }

  public async handleCurrentChange(val: number) {
    this.pager.pageNum = val
    await this.getIboxDeviceList()
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

  // public deleteIboxDevice(device: any) {
  //   this.$alertDelete({
  //     type: '设备',
  //     msg: `删除操作不能恢复，确认删除设备"${device.deviceName}"吗？`,
  //     method: deleteDevice,
  //     payload: {
  //       deviceId: device.deviceId,
  //       inProtocol: device.inProtocol
  //     },
  //     onSuccess: () => {
  //       this.getDirList()
  //       this.getDeviceList()
  //     }
  //   })
  // }

  public async startDevice(row: any) {
    const { deviceId, videos } = row
    const param = {
      deviceId,
      inProtocol: videos[0].inVideoProtocol
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

  public async stopDevice(row: any) {
    const { deviceId, videos } = row
    const param = {
      deviceId,
      inProtocol: videos[0].inVideoProtocol
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

  // @Provide('handleTools')
  // public async handleTools(type: string, payload: any) {
  //   if (type === 'deleteDevice') {
  //     await this.deleteIboxDevice(payload)
  //   }
  // }
}
