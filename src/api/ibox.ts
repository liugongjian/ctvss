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

// 删除设备
export const deleteDevice = (params: any) =>
  request({
    url: '/ibox/device',
    method: 'delete',
    params: toUpperCase(params)
  })

// 修改设备
export const editDeviceInfo = (params: any) =>
  request({
    url: '/ibox/device',
    method: 'put',
    data: toUpperCase(params)
  })

// 获取ibox凭证
export const getIBoxCertificates = () =>
  request({
    url: '/ibox/certificates',
    method: 'get'
    // data: toUpperCase(data)
  })
// 更新ibox凭证
export const freshIBoxCertificates = () =>
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

// 启动设备拉流
export const startDevice = (data: any) =>
  request({
    url: '/ibox/startdevice',
    method: 'post',
    data: toUpperCase(data)
  })

// 停止设备拉流
export const stopDevice = (data: any) =>
  request({
    url: '/ibox/stopdevice',
    method: 'post',
    data: toUpperCase(data)
  })

//  实时预览
export const getPreviewUrl = (params: any): Promise<any> => {
  const headers = params['self-defined-headers']
  delete params['self-defined-headers']
  const url = '/ibox/device/preview'
  return request({
    url,
    method: 'get',
    params: {
      OutNetwork: 'internet',
      OutProtocol: 'rtmp,flv,hls',
      Type: params.type || 'live',
      ...toUpperCase(params)
    },
    headers: headers
    // cancelToken
  })
}

// 解绑应用
export const unBindIboxApps = (data: any) =>
  request({
    url: '/ibox/ai/unBindIboxApps',
    method: 'post',
    data
  })

// 绑应用
export const bindIboxApps = (data: any) =>
  request({
    url: '/ibox/ai/bindIboxApps',
    method: 'post',
    data
  })

// 启动应用
export const startIboxApps = (data: any) =>
  request({
    url: '/ibox/ai/startIboxApps',
    method: 'post',
    data
  })

// 停止应用
export const stopIboxApps = (data: any) =>
  request({
    url: '/ibox/ai/stopIboxApps',
    method: 'post',
    data
  })

// 配置应用划线
export const configureIboxAlgorithm = (data: any) =>
  request({
    url: '/ibox/ai/configureIboxAlgorithm',
    method: 'post',
    data
  })

// 配置应用划线
export const getIboxFrames = (params: any) =>
  request({
    url: '/ibox/stream/frame',
    method: 'get',
    params: toUpperCase(params)
  })
