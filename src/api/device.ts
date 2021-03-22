import request from '@/utils/request'

export const getDevice = (params: any): Promise<any> =>
  request({
    url: '/device',
    method: 'get',
    params
  })

export const getDevices = (params: any): Promise<any> =>
  request({
    url: '/device/list',
    method: 'get',
    params
  })

export const getChannels = (params: any): Promise<any> =>
  request({
    url: '/device/channel',
    method: 'get',
    params
  })

export const createDevice = (params: any): Promise<any> =>
  request({
    url: '/device/create',
    method: 'post',
    data: params
  })

export const updateDevice = (params: any): Promise<any> =>
  request({
    url: '/device/update',
    method: 'post',
    data: params
  })

export const deleteDevice = (params: any): Promise<any> =>
  request({
    url: '/device/delete',
    method: 'post',
    data: params
  })

export const getDeviceTree = (params: any): Promise<any> =>
  request({
    url: '/device/tree',
    method: 'get',
    params
  })

export const getDevicePreview = (params: any): Promise<any> =>
  request({
    url: '/device/preview',
    method: 'get',
    params: {
      outProtocol: 'rtmp,flv,hls',
      type: params.type || 'live',
      ...params
    }
  })

export const getDeviceRecords = (params: any): Promise<any> =>
  request({
    url: '/record/list',
    method: 'get',
    params
  })

export const getDeviceRecord = (params: any): Promise<any> =>
  request({
    url: '/record',
    method: 'get',
    params
  })

export const getDeviceRecordRule = (params: any): Promise<any> =>
  request({
    url: '/record/rule',
    method: 'get',
    params
  })

export const getDeviceRecordStatistic = (params: any): Promise<any> =>
  request({
    url: '/record/statistic',
    method: 'get',
    params
  })

export const getDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record',
    method: 'get',
    params
  })

export const getDeviceCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/callback',
    method: 'get',
    params
  })

export const setDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record/bind',
    method: 'post',
    data: params
  })

export const setDeviceCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/callback/bind',
    method: 'post',
    data: params
  })

export const unbindDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record/unbind',
    method: 'post',
    data: params
  })

export const unbindDeviceCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/callback/unbind',
    method: 'post',
    data: params
  })

export const startDevice = (params: any): Promise<any> =>
  request({
    url: '/device/start',
    method: 'post',
    data: params
  })

export const stopDevice = (params: any): Promise<any> =>
  request({
    url: '/device/stop',
    method: 'post',
    data: params
  })

export const syncDevice = (params: any): Promise<any> =>
  request({
    url: '/device/sync',
    method: 'post',
    data: params
  })

export const startRecord = (params: any): Promise<any> =>
  request({
    url: '/record/task/start',
    method: 'post',
    data: params
  })

export const stopRecord = (params: any): Promise<any> =>
  request({
    url: '/record/task/stop',
    method: 'post',
    data: params
  })
