import request from '@/utils/request'

export const createDir = (params: any): Promise<any> =>
  request({
    url: '/dir/create',
    method: 'post',
    data: params
  })

export const updateDir = (params: any): Promise<any> =>
  request({
    url: '/dir/update',
    method: 'post',
    data: params
  })

export const deleteDir = (params: any): Promise<any> =>
  request({
    url: '/dir/delete',
    method: 'post',
    data: params
  })

export const bindDir = (params: any): Promise<any> =>
  request({
    url: '/dir/bind',
    method: 'post',
    data: params
  })
