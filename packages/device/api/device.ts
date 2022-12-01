import request from '@/utils/request'
import { UserModule } from '@/store/modules/user'
import { DeviceEnum, DeviceInTypeEnum, DeviceTypeEnum, StatusEnum } from '../enums/index'
import { DeviceInType, InVideoProtocolModelMapping, InViidProtocolModelMapping, InVideoProtocol, InViidProtocol } from '../dicts/index'

export const getDevices = (params: any): Promise<any> => {
  return new Promise(resolve => {
    request({
      url: '/device/list',
      method: 'get',
      params
    }).then((res: any) => {
      res.devices = res.devices.map(item => {
        const data = {
          [DeviceEnum.DeviceName]: item.device[DeviceEnum.DeviceName],
          [DeviceEnum.DeviceId]: item.device[DeviceEnum.DeviceId],
          [DeviceEnum.DeviceInType]: [],
          [DeviceEnum.InProtocol]: [],
          [DeviceEnum.DeviceType]: item.device[DeviceEnum.DeviceType],
          [DeviceEnum.VideoStatus]: '',
          [DeviceEnum.StreamStatus]: '',
          [DeviceEnum.RecordStatus]: '',
          [DeviceEnum.ViidStatus]: '',
          [DeviceEnum.OutId]: '',
          [DeviceEnum.DeviceChannelSize]: item.device[DeviceEnum.DeviceType] === DeviceTypeEnum.Nvr ? item.device[DeviceEnum.DeviceChannelSize] : '',
          [DeviceEnum.DeviceChannelNum]: item.device[DeviceEnum.DeviceChannelNum],
          [DeviceEnum.DeviceVendor]: item.device[DeviceEnum.DeviceVendor],
          [DeviceEnum.IsRoleShared]: item.device[DeviceEnum.IsRoleShared],
          [DeviceEnum.DeviceFrom]: item.device[DeviceEnum.DeviceFrom],
          [DeviceEnum.CreatedTime]: item[DeviceEnum.CreatedTime]
        }
        const inVideoProtocol = item.videos && item.videos.length && item.videos[0][DeviceEnum.InVideoProtocol]
        const inViidProtocol = item.viids && item.viids.length && item.viids[0][DeviceEnum.InViidProtocol]

        if (inVideoProtocol) {
          const videoInfo = item.videos[0][InVideoProtocolModelMapping[inVideoProtocol]]
          const deviceStreamPullIndex = videoInfo[DeviceEnum.DeviceStreamPullIndex] || 1
          data[DeviceEnum.OutId] = videoInfo[DeviceEnum.OutId]
          data[DeviceEnum.DeviceInType].push(DeviceInType[DeviceInTypeEnum.Video])
          data[DeviceEnum.InProtocol].push(InVideoProtocol[inVideoProtocol])
          data[DeviceEnum.VideoStatus] = videoInfo[DeviceEnum.DeviceStatus] && videoInfo[DeviceEnum.DeviceStatus][DeviceEnum.IsOnline]

          const streamInfo = videoInfo[DeviceEnum.Streams].length ? videoInfo[DeviceEnum.Streams].find(
            stream => stream[DeviceEnum.StreamNum] === deviceStreamPullIndex
          ) : {}
          data[DeviceEnum.StreamStatus] = streamInfo[DeviceEnum.StreamStatus]
          data[DeviceEnum.RecordStatus] = streamInfo[DeviceEnum.RecordStatus]
          data[DeviceEnum.RecordTaskId] = streamInfo[DeviceEnum.RecordTaskId]
        }

        if (inViidProtocol) {
          const viidInfo = item.viids[0][InViidProtocolModelMapping[inViidProtocol]]
          data[DeviceEnum.DeviceInType].push(DeviceInType[DeviceInTypeEnum.Viid])
          data[DeviceEnum.InProtocol].push(InViidProtocol[inViidProtocol])
          data[DeviceEnum.ViidStatus] = viidInfo[DeviceEnum.DeviceStatus] && viidInfo[DeviceEnum.DeviceStatus][DeviceEnum.IsOnline]
        }
        return data
      })
      resolve(res)
    })
  })
}

export const getDevicesIbox = (params: any): Promise<any> => {
  return new Promise(resolve => {
    request({
      url: '/ibox/devicelist',
      method: 'get',
      params
    }).then((res: any) => {
      res.devices = res.devices.map(item => {
        const data: any = {
          [DeviceEnum.DeviceName]: item.device[DeviceEnum.DeviceName],
          [DeviceEnum.DeviceId]: item.device[DeviceEnum.DeviceId],
          [DeviceEnum.DeviceInType]: [],
          [DeviceEnum.InProtocol]: [],
          [DeviceEnum.DeviceType]: item.device[DeviceEnum.DeviceType],
          [DeviceEnum.VideoStatus]: '',
          [DeviceEnum.StreamStatus]: '',
          [DeviceEnum.RecordStatus]: '',
          [DeviceEnum.ViidStatus]: '',
          [DeviceEnum.DeviceChannelSize]: item.device[DeviceEnum.DeviceChannelSize],
          [DeviceEnum.DeviceChannelNum]: item.device[DeviceEnum.DeviceChannelNum],
          [DeviceEnum.DeviceVendor]: item.device[DeviceEnum.DeviceVendor],
          [DeviceEnum.IsRoleShared]: item.device[DeviceEnum.IsRoleShared]
        }
        const inVideoProtocol = item.videos && item.videos.length && item.videos[0][DeviceEnum.InVideoProtocol]
        const inViidProtocol = item.viids && item.viids.length && item.viids[0][DeviceEnum.InViidProtocol]

        if (inVideoProtocol) {
          const videoInfo = item.videos[0][InVideoProtocolModelMapping[inVideoProtocol]]
          const deviceStreamPullIndex = videoInfo[DeviceEnum.DeviceStreamPullIndex] || 1
          data[DeviceEnum.DeviceInType].push(DeviceInType[DeviceInTypeEnum.Video])
          data[DeviceEnum.InProtocol].push(InVideoProtocol[inVideoProtocol])
          data[DeviceEnum.VideoStatus] = videoInfo[DeviceEnum.DeviceStatus][DeviceEnum.IsOnline]
          data[DeviceEnum.StreamStatus] = videoInfo[DeviceEnum.Streams] ? (videoInfo[DeviceEnum.Streams].some(
            stream => stream[DeviceEnum.DeviceStatus] === StatusEnum.On
          ) ? StatusEnum.On : StatusEnum.Off) : null
          data[DeviceEnum.RecordStatus] = videoInfo[DeviceEnum.Streams] ? (videoInfo[DeviceEnum.Streams][deviceStreamPullIndex - 1][DeviceEnum.RecordStatus]) : null
        }

        if (inViidProtocol) {
          const viidInfo = item.viids[0][InViidProtocolModelMapping[inViidProtocol]]
          data[DeviceEnum.DeviceInType].push(DeviceInType[DeviceInTypeEnum.Viid])
          data[DeviceEnum.InProtocol].push(InViidProtocol[inViidProtocol])
          data[DeviceEnum.ViidStatus] = viidInfo[DeviceEnum.DeviceStatus] && viidInfo[DeviceEnum.DeviceStatus][DeviceEnum.IsOnline]
        }
        return data
      })
      resolve(res)
    })
  })
}

export const exportDevicesExcel = (params: any): Promise<any> => 
  request({
    url: '/new/device',
    method: 'get',
    params
  })

/* ----------------------------------------------- */
/**
 * 获取设备详情
 */
export const getDevice = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/device/describe',
    method: 'get',
    params,
    cancelToken
  })


export const getDeviceRecentlyUsed = (): Promise<any> =>
  request({
    url: '/device/describe/recentlyUsed',
    method: 'get'
  })

export const getDeviceIbox = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/ibox/device',
    method: 'get',
    params,
    cancelToken
  })

/**
 * 获取设备列表
 */
export const getDevicesOld = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/device/list',
    method: 'get',
    params: {
      ...params,
      sortBy: 'OrderSequence',
      sortDirection: 'asc'
    },
    cancelToken
  })

/**
 * 获取子通道
 */
export const getChannels = (params: any): Promise<any> =>
  request({
    url: '/device/channel',
    method: 'get',
    params: {
      ...params,
      sortBy: 'OrderSequence',
      sortDirection: 'asc'
    }
  })

/**
 * 创建设备
 */
export const createDevice = (params: any): Promise<any> =>
  request({
    url: '/device/create',
    method: 'post',
    data: params
  })

export const createDeviceIbox = (params: any): Promise<any> =>
  request({
    url: '/ibox/device',
    method: 'post',
    data: params
  })

/**
 * 更新设备
 */
export const updateDevice = (params: any): Promise<any> =>
  request({
    url: '/device/update',
    method: 'post',
    data: params
  })

/**
 * 删除设备
 */
export const deleteDevice = (params: any): Promise<any> =>
  request({
    url: '/device/delete',
    method: 'post',
    data: params
  })

/**
 * 获取设备目录树
 */
// export const getDeviceTree = (params: any): Promise<any> => {
//   const headers = params['self-defined-headers']
//   delete params['self-defined-headers']
//   return request({
//     url: '/device/tree',
//     method: 'get',
//     params: {
//       ...params,
//       sortBy: 'OrderSequence',
//       sortDirection: 'asc'
//     },
//     headers: headers
//   })
// }

/**
 * 子目排序
 */
export const sortDeviceTree = (params: any): Promise<any> => {
  return request({
    url: '/device/location/move',
    method: 'post',
    data: params
  })
}

/**
 * 获取设备预览地址
 */
export const getDevicePreview = (params: any, cancelToken?: any): Promise<any> => {
  const headers = params['self-defined-headers']
  delete params['self-defined-headers']
  const url = params.isAi ? '/ai/preview' : '/device/preview'
  return request({
    url,
    method: 'get',
    params: {
      outNetwork: UserModule.outNetwork || undefined,
      outProtocol: 'rtmp,flv,hls',
      type: params.type || 'live',
      ...params
    },
    headers: headers,
    cancelToken
  })
}

/**
 * 获取设备录像列表
 */
export const getDeviceRecords = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/record/list',
    method: 'get',
    params: {
      outNetwork: UserModule.outNetwork || undefined,
      ...params
    },
    cancelToken
  })

/**
 * 获取检测到行人的时间段信息
 */
export const describeHeatMap = (data: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/record/describeheatmap',
    method: 'post',
    data,
    cancelToken
  })

/**
 * 获取设备录像详情
 */
export const getDeviceRecord = (params: any): Promise<any> =>
  request({
    url: '/record',
    method: 'get',
    params
  })

/**
 * 获取设备录制规则
 */
export const getDeviceRecordRule = (params: any): Promise<any> =>
  request({
    url: '/record/rule',
    method: 'get',
    params
  })

/**
 * 获取设备录制统计
 */
export const getDeviceRecordStatistic = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/record/statistic',
    method: 'get',
    params,
    cancelToken
  })

/**
 * 自定义录制片段名称
 */
export const editRecordName = (data: any): Promise<any> =>
  request({
    url: '/record/editRecordName',
    method: 'post',
    data
  })

/**
 * 设置本地录像的播放速率
 */
export const setRecordScale = (params: any): Promise<any> =>
  request({
    url: '/record/scale',
    method: 'post',
    data: params
  })

/**
 * 启用设备
 */
export const startDevice = (params: any): Promise<any> =>
  request({
    url: '/device/start',
    method: 'post',
    data: params
  })

/**
 * 停用设备
 */
export const stopDevice = (params: any): Promise<any> =>
  request({
    url: '/device/stop',
    method: 'post',
    data: params
  })

/**
 * 同步设备（平台）
 */
export const syncDevice = (params: any): Promise<any> =>
  request({
    url: '/device/sync',
    method: 'post',
    data: params
  })

/**
 * 同步设备状态
 */
export const syncDeviceStatus = (params: any): Promise<any> =>
  request({
    url: '/device/consistent',
    method: 'post',
    data: params
  })

/**
 * 轮询同步设备状态
 */
export const syncStatusPolling = (params: any): Promise<any> =>
  request({
    url: '/device/notifySync',
    method: 'get',
    params
  })

/**
 * 开始录制
 */
export const startRecord = (params: any): Promise<any> =>
  request({
    url: '/record/task/start',
    method: 'post',
    data: params
  })

/**
 * 停止录制
 */
export const stopRecord = (params: any): Promise<any> =>
  request({
    url: '/record/task/stop',
    method: 'post',
    data: params
  })

/**
 * 导入设备表格
 */
export const importDevice = (params: any): Promise<any> =>
  request({
    url: '/device/importDevice',
    method: 'post',
    data: params
  })

/**
 * 导出搜索结果
 */
export const exportSearchResult = (data: any): Promise<any> =>
  request({
    url: '/device/search/export',
    method: 'post',
    data: data
  })

/**
 * 导出全部设备表格
 */
export const exportDeviceAll = (params: any): Promise<any> =>
  request({
    url: '/device/exportDeviceAll',
    method: 'get',
    params,
    responseType: 'blob'
  })

/**
 * 导出选中设备表格
 */
export const exportDeviceOption = (params: any): Promise<any> =>
  request({
    url: '/device/exportDeviceOption',
    method: 'get',
    params,
    responseType: 'blob'
  })

  export const exportFailDevice = (params: any): Promise<any>=>
  request({
    url: '/device/exportFailedDevice',
    method: 'get',
    params,
    responseType: 'blob'
  })

/**
 * 获取子地址列表，返回Promise
 */
export const getAddressArea = (params: any, cancelToken: any): Promise<any> =>
  request({
    url: '/area/list',
    method: 'get',
    params,
    cancelToken
  })

/**
 * 获取子地址列表, 返回地址列表
 */
export const getChildAddress = async(id: any, level: number, cancelToken: any) => {
  const params: any = {
    pid: id,
    level
  }
  const res = await getAddressArea(params, cancelToken)
  let list = []
  if (res.areas.length) {
    list = res.areas.map((item: any) => {
      return {
        name: item.name,
        code: item.id,
        level: item.level,
        leaf: item.level === '4' ? true : undefined
      }
    })
  }
  return list
}

/**
 * 获取设备地址父级树结构，用户修改时回显
 */
export const getAddressAreaDir = (params: any): Promise<any> =>
  request({
    url: '/area/dir',
    method: 'get',
    params
  })

/**
 * 启用AI应用
 */
export const startAppResource = (params: any): Promise<any> =>
  request({
    url: '/aitask/device/start',
    method: 'post',
    data: params
  })

/**
 * 停用AI应用
 */
export const stopAppResource = (params: any): Promise<any> =>
  request({
    url: '/aitask/device/stop',
    method: 'post',
    data: params
  })

/**
 * 解绑AI应用
 */
export const unBindAppResource = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/bindorunbind',
    method: 'post',
    data: params
  })

/**
 * 获取ehome NVR子通道列表
 */
export const getChannelList = (params: any): Promise<any> =>
  request({
    url: '/device/nvrChannels',
    method: 'get',
    params
  })

/**
 * 编辑ehome NVR子通道列表
 */
export const configChannels = (params: any): Promise<any> =>
  request({
    url: '/device/configChannels',
    method: 'post',
    data: params
  })

/**
 * 获取设备事件列表
 */
export const getDeviceEvents = (params: any): Promise<any> =>
  request({
    url: '/device/event',
    method: 'get',
    params
  })

// player组件  缩放
export const dragCanvasZoom = (params: any): Promise<any> =>
  request({
    url: '/ptz/dragZoom',
    method: 'post',
    data: params
  })

/**
 * 校验国标ID
 */
export const validGbId = (params: any): Promise<any> =>
  request({
    url: '/device/customGbId',
    method: 'get',
    params
  })

/**
 * 创建视图库
 */
export const createViewLib = (params: any): Promise<any> =>
  request({
    url: '/viid/devices',
    method: 'post',
    data: params
  })
/**
 * 查询视图库详情
 */
export const getViewLibInfo = (params: any): Promise<any> =>
  request({
    url: `/viid/devices/${params.deviceId}`,
    method: 'get'
  })
/**
 * 修改视图库
 */
export const updateViewLib = (params: any): Promise<any> =>
  request({
    url: `/viid/devices/${params[0]}`,
    method: 'put',
    data: params[1]
  })

/**
 * 查询视图列表
 */
export const getViewsList = (params: any): Promise<any> =>
  request({
    url: '/viid/videoImages',
    method: 'get',
    params
  })

/**
 * 查询视图详情
 */
export const getViewDetail = (params: any): Promise<any> =>
  request({
    url: '/viid/videoImages/' + `${params.deviceId}/${params.type}/${params.id}`,
    method: 'get'
  })
