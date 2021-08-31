import request from '@/utils/request-origin'

export const getAppList = (): Promise<any> =>
  request({
    url: '/ai/aiAPP/describelist',
    method: 'get'
  })

export const getAlgorithmList = (query: any): Promise<any> =>
  request({
    url: '/ai/algorithms/describelist',
    method: 'get',
    query
  })
