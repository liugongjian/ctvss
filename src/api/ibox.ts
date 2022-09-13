import request from '@/utils/request'

// 获取盒子设备列表
export const getIBoxList = (params: any): Promise<any> =>
  request({
    url: '/iboxes',
    method: 'get',
    params
  })

// 获取盒子详情
export const getIBoxDetail = (params: any): Promise<any> =>
  request({
    url: '/ibox',
    method: 'get',
    params
  })

// 修改盒子信息
export const updateIBox = (data: any) =>
  request({
    url: '/ibox',
    method: 'put',
    data
  })

// 设备列表查询
export const getDeviceList = (params: any): Promise<any> =>
  request({
    url: '/ibox/device',
    method: 'get',
    params
  })
