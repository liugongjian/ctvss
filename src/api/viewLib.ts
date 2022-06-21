import request from '@/utils/request'

/**
 * 增加上级视图库
 */
export const createViewLibUpPlatform = (params: any) =>
  request({
    url: '/viid/cascade_viids',
    method: 'post',
    data: params
  })

/**
 * 更新上级视图库
 */
export const updateViewLibUpPlatform = (params: any) =>
  request({
    url: `/viid/cascade_viids/${1}`,
    method: 'put',
    data: params
  })

/**
 * 启动上级视图库
 */
export const enableViewLibUpPlatform = (params: any) =>
  request({
    url: `/viid/cascade_viids/${params}/active`,
    method: 'post'
  })

/**
 * 停止上级视图库
 */
export const stopViewLibUpPlatform = (params: any) =>
  request({
    url: `/viid/cascade_viids/${params}/inactive`,
    method: 'post'
  })

/**
 * 获取上级视图库列表
 */
export const getViewLibPlatformList = (params: any) =>
  request({
    url: '/viid/cascade_viids',
    method: 'get',
    params
  })
