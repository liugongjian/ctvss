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

export const setDevicePreset = (data: any): Promise<any> =>
  request({
    url: '/ptz/preset/set',
    method: 'post',
    data
  })

export const gotoDevicePreset = (data: any): Promise<any> =>
  request({
    url: '/ptz/preset/goto',
    method: 'post',
    data
  })

export const deleteDevicePreset = (data: any): Promise<any> =>
  request({
    url: '/ptz/preset/delete',
    method: 'post',
    data
  })

export const describeDevicePresets = (data: any): Promise<any> =>
  request({
    url: '/ptz/preset/list',
    method: 'get',
    params: data
  })

// 巡航
export const describePTZCruiseList = (data: any): Promise<any> =>
  request({
    url: '/ptz/cruise/list',
    method: 'get',
    params: data
  })

export const describePTZCruise = (data: any): Promise<any> =>
  request({
    url: '/ptz/cruise/preset',
    method: 'get',
    params: data
  })

export const updatePTZCruise = (data: any): Promise<any> =>
  request({
    url: '/ptz/cruise/add',
    method: 'post',
    data
  })

export const startPTZCruise = (data: any): Promise<any> =>
  request({
    url: '/ptz/cruise/start',
    method: 'post',
    data
  })

export const stopPTZCruise = (data: any): Promise<any> =>
  request({
    url: '/ptz/cruise/stop',
    method: 'post',
    data
  })

// 守望
export const describePTZKeepwatch = (data: any): Promise<any> =>
  request({
    url: '/ptz/keepwatch',
    method: 'get',
    params: data
  })

export const updatePTZKeepwatch = (data: any): Promise<any> =>
  request({
    url: '/ptz/startDeviceKeepwatch',
    method: 'get',
    params: data
  })

export const ptzLock = (data: any): Promise<any> =>
  request({
    url: '/ptz/lock',
    method: 'post',
    data
  })

export const ptzUnlock = (data: any): Promise<any> =>
  request({
    url: '/ptz/unlock',
    method: 'post',
    data
  })
