import request from '@/utils/request'

export const getGroups = (params: any): Promise<any> =>
  request({
    url: '/group/list',
    method: 'get',
    params
  })

export const createGroup = (params: any): Promise<any> =>
  request({
    url: '/group/create',
    method: 'post',
    data: params
  })

export const queryGroup = (params: any): Promise<any> =>
  request({
    url: '/group',
    method: 'get',
    params
  })

export const updateGroup = (params: any): Promise<any> =>
  request({
    url: '/group/update',
    method: 'post',
    data: params
  })

export const stopGroup = (params: any): Promise<any> =>
  request({
    url: '/group/stop',
    method: 'post',
    data: params
  })

export const startGroup = (params: any): Promise<any> =>
  request({
    url: '/group/start',
    method: 'post',
    data: params
  })

export const deleteGroup = (params: any): Promise<any> =>
  request({
    url: '/group/delete',
    method: 'post',
    data: params
  })

export const getGroupTemplate = (params: any): Promise<any> =>
  request({
    url: '/group/record',
    method: 'get',
    params
  })

export const getRecordTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/record/list',
    method: 'get',
    params
  })

export const getSnapshotTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/record/list',
    method: 'get',
    params
  })

export const setRecordTemplates = (params: any): Promise<any> =>
  request({
    url: '/group/record/bind',
    method: 'post',
    data: params
  })

export const setSnapshotTemplates = (params: any): Promise<any> =>
  request({
    url: '/group/template/snapshot',
    method: 'post',
    data: params
  })
