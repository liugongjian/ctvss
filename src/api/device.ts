import request from '@/utils/request'

/**
 * 获取设备详情
 */
export const getDevice = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/device',
    method: 'get',
    params,
    cancelToken
  })

/**
 * 获取设备列表
 */
export const getDevices = (params: any, cancelToken?: any): Promise<any> =>
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
export const getDeviceTree = (params: any): Promise<any> => {
  const headers = params['self-defined-headers']
  delete params['self-defined-headers']
  return request({
    url: '/device/tree',
    method: 'get',
    params: {
      ...params
      // sortBy: 'OrderSequence',
      // sortDirection: 'asc'
    },
    headers: headers
  })
}

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
  return request({
    url: '/device/preview',
    method: 'get',
    params: {
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
    params,
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
export const getDeviceRecordStatistic = (params: any): Promise<any> =>
  request({
    url: '/record/statistic',
    method: 'get',
    params
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
 * 获取设备录制模版
 */
export const getDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record',
    method: 'get',
    params
  })

/**
 * 获取设备回调模版
 */
export const getDeviceCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/callback',
    method: 'get',
    params
  })

/**
 * 设置设备录制模版
 */
export const setDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record/bind',
    method: 'post',
    data: params
  })

/**
 * 设置设备回调模版
 */
export const setDeviceCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/callback/bind',
    method: 'post',
    data: params
  })

/**
 * 解绑设备录制模版
 */
export const unbindDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record/unbind',
    method: 'post',
    data: params
  })

/**
 * 解绑设备回调模版
 */
export const unbindDeviceCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/callback/unbind',
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
 * 导出全部设备表格
 */
export const exportDeviceAll = (params: any): Promise<any> =>
  request({
    url: '/device/exportDeviceAll',
    method: 'post',
    data: params
  })

/**
 * 导出选中设备表格
 */
export const exportDeviceOption = (params: any): Promise<any> =>
  request({
    url: '/device/exportDeviceOption',
    method: 'post',
    data: params
  })

/**
 * 获取连州公安局列表
 */
export const getLianzhouArea = (params: any): Promise<any> =>
  request({
    url: '/area/list',
    method: 'get',
    params
  })
