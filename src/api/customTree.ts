import request from '@/utils/request'
/**
 * 查询自定义树列表
 */
export const getTreeList = (params: any): Promise<any> => {
  return request({
    url: '/tree/customize/list',
    method: 'get',
    params
  })
}

/**
 * 创建自定义树
 */
export const createTree = (params: any): Promise<any> => {
  return request({
    url: '/tree/customize/create',
    method: 'post',
    data: params
  })
}

/**
 * 删除自定义树
 */
export const deleteTree = (params: any): Promise<any> => {
  return request({
    url: '/tree/customize/delete',
    method: 'post',
    data: params
  })
}

/**
 * 加载自定义树节点
 */
export const loadTreeNode = (params: any): Promise<any> => {
  return request({
    url: '/tree/customize/nodes',
    method: 'get',
    params
  })
}

/**
 * 更新自定义树节点
 */
export const updateTreeNodes = (params: any): Promise<any> => {
  return request({
    url: '/tree/customize/nodes/update',
    method: 'post',
    data: params
  })
}

/**
 * 更新自定义树名称
 */
export const updateTreeName = (params: any): Promise<any> => {
  return request({
    url: '/tree/customize/update',
    method: 'post',
    data: params
  })
}

/**
 * 加载自定义树中所有节点
 */

export const describeTreeIds = (params: any): Promise<any> => {
  return request({
    url: '/tree/customize/deviceIds',
    method: 'get',
    params
  })
}
