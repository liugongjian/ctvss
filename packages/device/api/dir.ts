import request from '@/utils/request'
import { toUpperCase } from '@vss/base/utils/param'

export const createDir = (params: any): Promise<any> =>
  request({
    url: '/dir/create',
    method: 'post',
    data: toUpperCase(params)
  })

export const updateDir = (params: any): Promise<any> =>
  request({
    url: '/dir/update',
    method: 'post',
    data: toUpperCase(params)
  })

export const deleteDir = (params: any): Promise<any> =>
  request({
    url: '/dir/delete',
    method: 'post',
    data: toUpperCase(params)
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
   params: toUpperCase(params)
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
   data: toUpperCase(params)
 })

export const bindDir = (params: any): Promise<any> =>
  request({
    url: '/dir/bind',
    method: 'post',
    data: toUpperCase(params)
  })
