import request from '@/utils/request'

export const getSecretList = (params: any = {}): Promise<any> =>
  request({
    url: '/openapi/list',
    method: 'get',
    params
  })

export const createSecret = (data: any = undefined): Promise<any> =>
  request({
    url: '/openapi/create',
    method: 'post',
    data
  })

export const deleteSecret = (params: number, type = undefined): Promise<any> =>
  request({
    url: '/openapi/delete',
    method: 'post',
    data: {
      id: params,
      type
    }
  })

export const enableSecret = (params: number): Promise<any> =>
  request({
    url: '/openapi/start',
    method: 'post',
    data: {
      id: params
    }
  })

export const disableSecret = (params: number): Promise<any> =>
  request({
    url: '/openapi/stop',
    method: 'post',
    data: {
      id: params
    }
  })
