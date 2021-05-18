import request from '@/utils/request'

/**
 * 查询资源包详情
 */
export const getResources = (params: any): Promise<any> =>
  request({
    url: '/resource/list',
    method: 'get',
    params
  })
