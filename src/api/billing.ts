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

/**
 * 查询与资源包绑定的设备列表
 */
export const getResourceDevices = (params: any): Promise<any> =>
  request({
    url: 'resource/describeAttachedDevices',
    method: 'get',
    params
  })

//  获取资源包下已绑定过的能力
export const getResourceIdAttachedAppIds = (params:any):Promise<any> =>
  request({
    url: 'ai/aiAPP/describeResourceIdAttachedAppIds',
    method: 'get',
    params
  })
