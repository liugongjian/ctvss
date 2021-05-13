import request from '@/utils/request'

/**
 * 创建平台
 */
export const createPlatform = (params: any): Promise<any> =>
  request({
    url: '/platform/create',
    method: 'post',
    data: params
  })

/**
 * 查询上级平台列表
 */
export const getPlatforms = (params: any): Promise<any> =>
  request({
    url: '/platform/platforms/describe',
    method: 'get',
    params
  })

/**
 * 删除上级平台
 */
export const deletePlatform = (params: any): Promise<any> =>
  request({
    url: '/platform/delete',
    method: 'post',
    data: params
  })
