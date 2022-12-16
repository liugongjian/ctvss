import request from '@/utils/request'

export const getStatistics = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/overview',
    method: 'get',
    params
  })

export const getRecord = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/record',
    method: 'get',
    params
  })

export const getRecordLog = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/record/log',
    method: 'get',
    params
  })

export const setRecordThreshold = (data: any = {}): Promise<any> =>
  request({
    url: '/statistics/record',
    method: 'post',
    data
  })

export const getDeviceList = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/deviceList',
    method: 'get',
    params
  })

export const exportDeviceList = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/deviceExport',
    method: 'get',
    params,
    responseType: 'blob'
  })
