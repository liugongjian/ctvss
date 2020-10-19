import request from '@/utils/request'

// 录制模板相关接口
export const getRecordBind = (params: any): Promise<any> =>
  request({
    url: '/template/record/bind',
    method: 'get',
    params
  })

export const getRecordTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/record/list',
    method: 'get',
    params
  })

export const queryRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record',
    method: 'get',
    params
  })

export const createRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record/create',
    method: 'post',
    data: params
  })

export const updateRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record/update',
    method: 'post',
    data: params
  })

export const deleteRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record/delete',
    method: 'post',
    data: params
  })

// 回调模板相关接口
export const getCallbackBind = (params: any): Promise<any> =>
  request({
    url: '/template/callback/bind',
    method: 'get',
    params
  })

export const getCallbackTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/callback/list',
    method: 'get',
    params
  })

export const queryCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback',
    method: 'get',
    params
  })

export const createCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback/create',
    method: 'post',
    data: params
  })

export const updateCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback/update',
    method: 'post',
    data: params
  })

export const deleteCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback/delete',
    method: 'post',
    data: params
  })

// 截图模板相关接口
export const getSnapshotTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot/list',
    method: 'get',
    params
  })

export const querySnapshotTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot',
    method: 'get',
    params
  })

export const createSnapshotTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot/create',
    method: 'post',
    data: params
  })

export const updateSnapshotTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot/update',
    method: 'post',
    data: params
  })

export const deleteSnapshotTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot/delete',
    method: 'post',
    data: params
  })
