import request from '@/utils/request'
import { toUpperCase } from '@/utils/param'

// 获取盒子设备列表
export const getIBoxList = (params: any): Promise<any> =>
  request({
    url: '/iboxes',
    method: 'get',
    params: toUpperCase(params)
  })

// 获取盒子详情
export const getIBoxDetail = (params: any): Promise<any> =>
  request({
    url: '/ibox',
    method: 'get',
    params: toUpperCase(params)
  })

// 修改盒子信息
export const updateIBox = (data: any): Promise<any> =>
  request({
    url: '/ibox',
    method: 'put',
    data: toUpperCase(data)
  })

// 设备列表查询
export const getDeviceList = (params: any): Promise<any> =>
  request({
    url: '/ibox/devicelist',
    method: 'get',
    params: toUpperCase(params)
  })

// 设备创建
export const createDevice = (data: any) =>
  request({
    url: '/ibox/device',
    method: 'post',
    data: toUpperCase(data)
  })

// 设备详情
export const getDeviceDetail = (params: any) =>
  request({
    url: '/ibox/device',
    method: 'get',
    params: toUpperCase(params)
  })

// ibox凭证 /v1/ibox/certificates
export const getIBoxCertificates = () =>
  request({
    url: '/ibox/certificates',
    method: 'post'
    // data: toUpperCase(data)
  })

// 获取IBox AI应用列表
export const describeIboxApps = (data) =>
  request({
    url: '/ibox/ai/describeIboxApps',
    method: 'post',
    data
  })

// 获取算法列表
export const describeAlgorithmList = (data) =>
  request({
    url: '/ibox/ai/describeIboxAlgorithms',
    method: 'post',
    data
  })

export const describeIboxAlgorithms = (data) =>
  request({
    url: '/ibox/ai/describeIboxAlgorithms',
    method: 'post',
    data
  })

export const createIboxApp = (data) =>
  request({
    url: '/ibox/ai/createIboxApp',
    method: 'post',
    data
  })

export const describeIboxApp = (data) => request({
  url: '/ibox/ai/describeIboxApp',
  method: 'post',
  data
})

export const updateIboxApp = (data) => request({
  url: '/ibox/ai/updateIboxApp',
  method: 'post',
  data
})

export const deleteIboxApps = (data) => request({
  url: '/ibox/ai/deleteIboxApps',
  method: 'post',
  data
})
