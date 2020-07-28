import request from '@/utils/request-mock'

export const deleteDir = (params: any): Promise<any> =>
  request({
    url: '/dir/delete',
    method: 'post',
    data: params
  })
