import request from '@/utils/request'

export const getList = (params: any): Promise<any> =>
  request({
    url: '/certificate/ehome/list',
    method: 'get',
    params
  })

export const createCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ehome/create',
    method: 'post',
    data: params
  })

export const deleteCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ehome/delete',
    method: 'post',
    data: params
  })

export const updateCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ehome/update',
    method: 'post',
    data: params
  })

export const queryCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ehome',
    method: 'get',
    params
  })
