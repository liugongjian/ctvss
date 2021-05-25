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
 * 修改平台
 */
export const updatePlatform = (params: any): Promise<any> =>
  request({
    url: '/platform/modify',
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
 * 查询上级平台
 */
export const getPlatform = (params: any): Promise<any> =>
  request({
    url: '/platform/describe',
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

/**
 * 共享设备业务组查询
 */
export const describeShareGroups = (params: any): Promise<any> =>
  request({
    url: '/device/platform/describeShareGroups',
    method: 'get',
    params
  })

/**
 * 共享设备目录查询
 */
export const describeShareDirs = (params: any): Promise<any> =>
  request({
    url: '/device/platform/describeShareDirs',
    method: 'get',
    params
  })

/**
 * 共享设备列表查询
 */
export const describeShareDevices = (params: any): Promise<any> =>
  request({
    url: '/device/platform/describeShareDevices',
    method: 'get',
    params
  })

/**
 * 共享设备
 */
export const shareDevice = (params: any): Promise<any> =>
  request({
    url: '/device/platform/shareDevice',
    method: 'post',
    data: params
  })

/**
 * 取消共享设备
 */
export const cancleShareDevice = (params: any): Promise<any> =>
  request({
    url: '/device/platform/cancleShareDevice',
    method: 'post',
    data: params
  })

/**
 * 取消共享设备
 */
export const cancleShareDir = (params: any): Promise<any> =>
  request({
    url: '/device/platform/cancleShareDir',
    method: 'post',
    data: params
  })

/**
 * 启动级联
 */
export const startShareDevice = (params: any): Promise<any> =>
  request({
    url: '/device/platform/startShareDevice',
    method: 'get',
    params
  })

/**
 * 停止级联
 */
export const stopShareDevice = (params: any): Promise<any> =>
  request({
    url: '/device/platform/stopShareDevice',
    method: 'get',
    params
  })
