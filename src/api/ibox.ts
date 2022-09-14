import request from '@/utils/request'
import { toUpperCase, toLowerCase } from '@/utils/param'

// 获取盒子设备列表
export const getIBoxList = (params: any): Promise<any> =>
  request({
    url: '/iboxes',
    method: 'get',
    params: toUpperCase(params)
  }).then(res => (toLowerCase(res) as any).data)

// 获取盒子详情
export const getIBoxDetail = (params: any): Promise<any> =>
  request({
    url: '/ibox',
    method: 'get',
    params: toUpperCase(params)
  }).then(res => (toLowerCase(res) as any).data)

// 修改盒子信息
export const updateIBox = (data: any): Promise<any> =>
  request({
    url: '/ibox',
    method: 'put',
    data: toUpperCase(data)
  }).then(res => (toLowerCase(res) as any).data)

// 设备列表查询
export const getDeviceList = (params: any): Promise<any> =>
  request({
    url: '/ibox/devicelist',
    method: 'get',
    params: toUpperCase(params)
  }).then(res => (toLowerCase(res) as any).data)

// 设备创建
export const createDevice = (data: any) =>
  request({
    url: '/ibox/device',
    method: 'post',
    data: toUpperCase(data)
  }).then(res => (toLowerCase(res) as any).data)
