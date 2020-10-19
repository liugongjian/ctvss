import request from '@/utils/request'

export const getStreamList = (params: any): Promise<any> =>
  request({
    url: '/rtmp/stream/list',
    method: 'get',
    params
  })

export const getStream = (params: any): Promise<any> =>
  request({
    url: '/rtmp/stream',
    method: 'get',
    params
  })

export const createStream = (params: any): Promise<any> =>
  request({
    url: '/rtmp/stream/push/url',
    method: 'post',
    data: params
  })

export const getStreamRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/rtmp/stream/record',
    method: 'get',
    params
  })

export const getStreamCallBackTemplate = (params: any): Promise<any> =>
  request({
    url: '/rtmp/stream/callback',
    method: 'get',
    params
  })

export const setStreamCallBackTemplate = (params: any): Promise<any> =>
  request({
    url: '/rtmp/stream/callback/bind',
    method: 'post',
    data: params
  })

export const unbindStreamCallBackTemplate = (params: any): Promise<any> =>
  request({
    url: '/rtmp/stream/callback/unbind',
    method: 'post',
    data: params
  })

export const setStreamRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/rtmp/stream/record/bind',
    method: 'post',
    data: params
  })

export const unbindStreamRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/rtmp/stream/record/unbind',
    method: 'post',
    data: params
  })

export const getCallBackTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/callback/list',
    method: 'get',
    params
  })
