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
    url: '/map/CreateMap',
    method: 'get',
    params: {
      ...params
    }
  })

/**
 * 删除电子地图
 */
export const deleteMap = (params: any): Promise<any> =>
  request({
    url: '/map/DeleteMap',
    method: 'get',
    params: {
      ...params
    }
  })

/**
 * 编辑电子地图
 */
export const modifyMap = (params: any): Promise<any> =>
  request({
    url: '/map/ModifyMap',
    method: 'get',
    params: {
      ...params
    }
  })

/**
 * 查询地图标识（设备）
 */
export const getMapDevices = (params: any): Promise<any> =>
  request({
    url: '/map/DescribeMapMarkers',
    method: 'get',
    params: {
      ...params,
      type: 'device'
    }
  })

/**
 * 添加地图标识
 */
export const addMarkers = (params: any): Promise<any> =>
  request({
    url: '/map/MarkOnMap',
    method: 'get',
    params: {
      ...params
    }
  })

/**
 * 编辑地图标识
 */
export const updateMarkers = (params: any): Promise<any> =>
  request({
    url: '/map/ReMarkOnMap',
    method: 'get',
    params: {
      ...params
    }
  })

/**
 * 移除地图标识
 */
export const deleteMarkers = (params: any): Promise<any> =>
  request({
    url: '/map/UnMarkOnMap',
    method: 'get',
    params: {
      ...params
    }
  })
