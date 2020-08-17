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
    params
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

export const getRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record',
    method: 'get',
    params
  })

export const setDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record/bind',
    method: 'post',
    data: params
  })

export const unbindDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record/unbind',
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
