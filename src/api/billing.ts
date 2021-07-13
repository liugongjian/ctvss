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

/**
 * 设备查询绑定资源包列表
 */
export const getDeviceResources = (params: any): Promise<any> =>
  request({
    url: '/resource/bind/list',
    method: 'get',
    params
  })

/**
 * 更新设备资源包
 */
export const updateDeviceResources = (params: any): Promise<any> =>
  request({
    url: '/resource/bind/change',
    method: 'post',
    data: params
  })
