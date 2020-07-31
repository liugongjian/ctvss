import request from '@/utils/request-mock'

export const createDir = (params: any): Promise<any> =>
  request({
    url: '/dir/create',
    method: 'post',
    data: params
  })

export const deleteDir = (params: any): Promise<any> =>
  request({
    url: '/dir/delete',
    method: 'post',
    data: params
  })
