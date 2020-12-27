import request from '@/utils/request'

export const getAIConfigGroupData = (params: any): Promise<any> =>
  request({
    url: '/statistics/device',
    method: 'get',
    params
  })

export const addGroup = (data: any): Promise<any> =>
  request({
    url: '/statistics/device',
    method: 'post',
    data
  })

export const getPerson = (params: any): Promise<any> =>
  request({
    url: '/statistics/device',
    method: 'get',
    params
  })
