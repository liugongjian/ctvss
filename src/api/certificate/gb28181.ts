import request from '@/utils/request'

export const getList = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/list',
    method: 'get',
    params
  })

export const createCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/create',
    method: 'post',
    data: params
  })

export const deleteCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/delete',
    method: 'post',
    data: params
  })

export const updateCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/update',
    method: 'post',
    data: params
  })

export const queryCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181',
    method: 'get',
    params
  })
