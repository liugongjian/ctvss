import request from '@/utils/request'

/**
 * 获取设备列表
 */
export const getDetailList = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/device/detail/list',
    method: 'get',
    params,
    cancelToken
  })

/**
 * 获取设备导出列表
 */
export const getDetailExport = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/device/detail/export',
    method: 'get',
    params,
    cancelToken
  })

/**
 * 获取设备导出列表V2
 */
export const getDetailExportV2 = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/device/detail/export',
    method: 'get',
    params,
    responseType: 'blob',
    cancelToken
  })
