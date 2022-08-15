import request from '@/utils/request'

/* gb28181 */
export const getGb28181List = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/list',
    method: 'get',
    params
  })

export const createGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/create',
    method: 'post',
    data: params
  })

export const deleteGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/delete',
    method: 'post',
    data: params
  })

export const updateGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/update',
    method: 'post',
    data: params
  })

export const queryGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181',
    method: 'get',
    params
  })

/* viid */
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
