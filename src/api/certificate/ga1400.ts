import request from '@/utils/request'

export const getList = (params: any): Promise<any> =>
  request({
    url: '/viid/certificates/ga1400',
    method: 'get',
    params
  })

export const createCertificate = (params: any): Promise<any> =>
  request({
    url: '/viid/certificates/ga1400',
    method: 'post',
    data: params
  })

export const deleteCertificate = (params: any): Promise<any> =>
  request({
    url: '/viid/certificates/ga1400/' + params.id,
    method: 'delete',
    data: params
  })

export const updateCertificate = (params: any, id: string): Promise<any> =>
  request({
    url: '/viid/certificates/ga1400/' + id,
    method: 'put',
    data: params
  })

export const queryCertificate = (params: any): Promise<any> =>
  request({
    url: '/viid/certificates/ga1400',
    method: 'get',
    params
  })
