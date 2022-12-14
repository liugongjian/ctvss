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
