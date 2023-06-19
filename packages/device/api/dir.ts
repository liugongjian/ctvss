import request from '@/utils/request'

/**
 * 创建目录
 * @param params
 * @returns 
 */
export const createDir = (params: any): Promise<any> =>
  request({
    url: '/dir/create',
    method: 'post',
    data: params
  })

/**
 * 编辑目录
 * @param params
 * @returns 
 */
export const updateDir = (params: any): Promise<any> =>
  request({
    url: '/dir/update',
    method: 'post',
    data: params
  })

/**
 * 查询目录
 * @param params
 * @returns 
 */
 export const getDir = (params: any): Promise<any> =>
 request({
   url: '/dir/describe',
   method: 'get',
   params
 })

/**
 * 删除目录
 * @param params
 * @returns 
 */
export const deleteDir = (params: any): Promise<any> =>
  request({
    url: '/dir/delete',
    method: 'post',
    data: params
  })

/**
 * 获取设备目录树节点
 */
export const getNodeInfo = (params: any): Promise<any> =>
 request({
   url: '/dir/list/status',
   method: 'get',
   params
 })

/**
 * 获取目录下所有设备
 */
export const getPollList = (params: any): Promise<any> =>
  request({
    url: '/dir/list/poll',
    method: 'get',
    params
  })

export const getDeviceTree = (params): Promise<any> =>
  request({
    url: '/dir/list/status/search',
    method: 'get',
    params
  })

/**
 * 获取目录对应路径（面包屑）
 * @param params
 * @returns 
 */
 export const getDirPath = (params: any): Promise<any> => 
 request({
   url: '/dir/path',
   method: 'get',
   params
 })

/**
 * 目录排序
 * @param params
 * @returns 
 */
 export const sortDir = (params: any): Promise<any> => 
 request({
   url: '/location/move',
   method: 'post',
   data: params
 })

export const bindDir = (params: any): Promise<any> =>
  request({
    url: '/dir/bind',
    method: 'post',
    data: params
  })

// 账号权限-预览
export const previewAuthActions = (data: any): Promise<any> =>
request({
  url: '/iam/authpreview',
  method: 'post',
  data
})

// 查看指定设备或目录的赋权子账号列表
export const describeAuthIamUsers = (data: any): Promise<any> =>
  request({
    url: '/iam/auth/users',
    method: 'post',
    data
  })
