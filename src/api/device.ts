import request from '@/utils/request-mock'

export const getDevices = (params: any): Promise<any> =>
  request({
    url: '/device/list',
    method: 'get',
    params
  })
