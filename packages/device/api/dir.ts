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

export const bindDir = (params: any): Promise<any> =>
  request({
    url: '/dir/bind',
    method: 'post',
    data: toUpperCase(params)
  })
