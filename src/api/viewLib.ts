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
 * 增加上级视图库
 */
export const updateViewLibUpPlatform = (params: any) =>
  request({
    url: `/viid/cascade_viids/${}`,
    method: 'put',
    data: params
  })

/**
 * 增加上级视图库
 */
export const enableViewLibUpPlatform = (params: any) =>
  request({
    url: `/viid/cascade_viids/${}/active`,
    method: 'post',
    data: params
  })

/**
 * 增加上级视图库
 */
export const stopViewLibUpPlatform = (params: any) =>
  request({
    url: `/viid/cascade_viids/${}/inactive`,
    method: 'post',
    data: params
  })

/**
 * 增加上级视图库
 */
export const getViewLibPlatformList = (params: any) =>
  request({
    url: '/viid/cascade_viids',
    method: 'get',
    params
  })
