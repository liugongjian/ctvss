import request from '@/utils/request'

export const getSecretList = (): Promise<any> =>
  request({
    url: '/openapi/list',
    method: 'get'
  })

export const createSecret = (): Promise<any> =>
  request({
    url: '/openapi/create',
    method: 'post'
  })

export const deleteSecret = (params: number): Promise<any> =>
  request({
    url: '/openapi/delete',
    method: 'post',
    data: {
      id: params
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
