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
 * 判断是否支持按需加载
 * @param params 
 * @returns 
 */
export const ondemandSubscribe = (): Promise<any> =>
  request({
    url: '/resource/ondemandSubscribe',
    method: 'get'
  })

/**
 * 设备查询绑定资源包列表
 */
export const getDeviceResource = (params: any): Promise<any> =>
  request({
    url: '/device/resource/list',
    method: 'get',
    params
  })

/**
 * 更新设备资源包
 */
export const updateDeviceResource = (params: any): Promise<any> =>
  request({
    url: '/resource/update',
    method: 'post',
    data: params
  })
