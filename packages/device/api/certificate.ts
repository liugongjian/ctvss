import request from '@/utils/request'
import { toUpperCase } from '@vss/base/utils/param'

/**
 * =============================
 * Video
 * =============================
 */
export const getGb28181CertificateList = (params: any): Promise<any> =>
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

export const getGb28181Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/gb28181',
    method: 'get',
    params
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
    params: toUpperCase(params)
  })

export const createGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/create',
    method: 'post',
    data: toUpperCase(params)
  })

export const deleteGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/delete',
    method: 'post',
    data: toUpperCase(params)
  })

export const updateGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/update',
    method: 'post',
    data: toUpperCase(params)
  })

export const getGa1400Certificate = (params: any): Promise<any> =>
  request({
    url: '/certificate/ga1400/describe',
    method: 'get',
    params: toUpperCase(params)
  })