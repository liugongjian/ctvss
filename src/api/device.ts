import request from '@/utils/request-mock'

export const getDevices = (params: any) =>
  request({
    url: '/device/list',
    method: 'get',
    params
  })
