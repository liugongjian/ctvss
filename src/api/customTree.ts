import request from '@/utils/request'
import axios from 'axios' // mock

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
  return axios({
    url: 'https://www.fastmock.site/mock/62efb2ba1dccaef2d790bcc59ce8ac89/tree/customize/description',
    method: 'post',
    data: params
  })
}

/**
 * 加载自定义树中所有节点
 */
export const describeTreeIds = (params: any): Promise<any> => {
  return axios({
    url: 'https://www.fastmock.site/mock/62efb2ba1dccaef2d790bcc59ce8ac89/tree/customize/deviceIds',
    method: 'post',
    data: params
  })
}
