import request from '@/utils/request'

/**
 * =============================
 * Video
 * =============================
 */

/* GB28181 */
export const getGb28181CertificateList = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/list',
    method: 'get',
    params: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

export const createGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/create',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

export const deleteGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/delete',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

export const updateGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/update',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

export const getGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/describe',
    method: 'get',
    params: {
      ...params,
      inProtocol: 'gb28181'
    }
  })

/* ehome */
export const getEhomeCertificateList = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/list',
    method: 'get',
    params: {
      ...params,
      inProtocol: 'ehome'
    }
  })

export const createEhomeCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/create',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'ehome'
    }
  })

export const deleteEhomeCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/delete',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'ehome'
    }
  })

export const updateEhomeCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181/update',
    method: 'post',
    data: {
      ...params,
      inProtocol: 'ehome'
    }
  })

export const getEhomeCertificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181',
    method: 'get',
    params: {
      ...params,
      inProtocol: 'ehome'
    }
  })

/**
 * =============================
 * VIID
 * =============================
 */
export const getGa1400CertificateList = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/list',
    method: 'get',
    params
  })

export const createGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/create',
    method: 'post',
    data: params
  })

export const deleteGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/delete',
    method: 'post',
    data: params
  })

export const updateGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/update',
    method: 'post',
    data: params
  })

export const getGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/describe',
    method: 'get',
    params
  })
