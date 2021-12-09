import request from '@/utils/request'

export const getList = (params: any): Promise<any> =>
  request({
    url: '/ga1400/cert/list',
    method: 'get',
    params
  })

export const createCertificate = (params: any): Promise<any> =>
  request({
    url: '/ga1400/cert/create',
    method: 'post',
    data: params
  })

export const deleteCertificate = (params: any): Promise<any> =>
  request({
    url: '/ga1400/cert/delete',
    method: 'post',
    data: params
  })

export const updateCertificate = (params: any): Promise<any> =>
  request({
    url: '/ga1400/cert/update',
    method: 'post',
    data: params
  })

export const queryCertificate = (params: any): Promise<any> =>
  request({
    url: '/ga1400/cert/des',
    method: 'get',
    params
  })
