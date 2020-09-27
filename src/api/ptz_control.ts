import request from '@/utils/request'

export const startDeviceMove = (data: any): Promise<any> =>
  request({
    url: '/ptz/move/start',
    method: 'post',
    data
  })

export const endDeviceMove = (data: any): Promise<any> =>
  request({
    url: '/ptz/move/stop',
    method: 'post',
    data
  })

export const startDeviceAdjust = (data: any): Promise<any> =>
  request({
    url: '/ptz/adjust/start',
    method: 'post',
    data
  })

export const endDeviceAdjust = (data: any): Promise<any> =>
  request({
    url: '/ptz/adjust/stop',
    method: 'post',
    data
  })