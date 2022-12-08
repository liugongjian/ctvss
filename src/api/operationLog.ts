import request from '@/utils/request'

export const getOptLog = (params: any): Promise<any> =>
  request({
    url: '/logs',
    method: 'get',
    params
  })

export const getOptLogById = (params: any): Promise<any> =>
  request({
    url: '/logs',
    method: 'get',
    params
  })

export const getOptName = (): Promise<any> =>
  request({
    url: '/operationNames',
    method: 'get',
  })