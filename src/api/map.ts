import request from '@/utils/request'

/**
 * 查询电子地图列表
 */
export const getMaps = (params: any): Promise<any> =>
  request({
    url: '/map/DescribeMaps',
    method: 'get',
    params: {
      ...params,
      sortBy: 'CreatedTime',
      sortDirection: 'asc'
    }
  })

/**
 * 新建电子地图
 */
export const createMap = (params: any): Promise<any> => 
  request({
    url: '/map/create',
    method: 'post',
    data: params
  })

/**
 * 删除电子地图
 */
export const deleteMap = (params: any): Promise<any> => 
  request({
    url: '/map/delete',
    method: 'post',
    data: params
  })

/**
 * 编辑电子地图
 */
export const modifyMap = (params: any): Promise<any> =>
  request({
    url: '/map/update',
    method: 'post',
    data: params
  })


/**
 * 查询地图标识（设备）
 */
export const getMapDevices = (params: any, cancelToken: any): Promise<any> =>
  request({
    url: '/map/DescribeMapMarkers',
    method: 'get',
    params: {
      ...params,
      type: 'device'
    },
    cancelToken
  })

/**
 * 添加地图标识
 */
export const addMarkers = (params: any): Promise<any> =>
  request({
    url: '/map/MarkOnMap',
    method: 'post',
    data: params
  })

/**
 * 编辑地图标识
 */
export const updateMarkers = (params: any): Promise<any> =>
  request({
    url: '/map/ReMarkOnMap',
    method: 'post',
    data: params
  })

/**
 * 移除地图标识
 */
export const deleteMarkers = (params: any): Promise<any> =>
  request({
    url: '/map/UnMarkOnMap',
    method: 'post',
    data: params
  })

/**
 * 查询兴趣点列表
 */
export const getInterestList = (params: any): Promise<any> =>
  request({
    url: '/map/tag/list',
    method: 'get',
    params
  })

/**
 * 查询兴趣点
 */
export const getInterestPoint = (params: any): Promise<any> =>
  request({
    url: '/map/tag',
    method: 'get',
    params
  })

/**
 * 修改兴趣点
 */
export const editInterestPoint = (params: any): Promise<any> =>
  request({
    url: '/map/tag/update',
    method: 'post',
    data: params
  })

/**
 * 删除兴趣点
 */
export const delInterestPoint = (params: any): Promise<any> =>
  request({
    url: '/map/tag/delete',
    method: 'post',
    data: params
  })

/**
 * 新增兴趣点
 */
export const addInterestPoint = (params: any): Promise<any> =>
  request({
    url: '/map/tag/create',
    method: 'post',
    data: params
  })
