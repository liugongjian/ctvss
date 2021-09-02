import request from '@/utils/request-origin'

export const getAbilityList = (): Promise<any> =>
  request({
    url: '/ai/aiAbility/describelist',
    method: 'get'
  })

export const getAppList = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/describelist',
    method: 'get',
    params
  })

export const getAlgorithmList = (params: any): Promise<any> =>
  request({
    url: '/ai/algorithms/describelist',
    method: 'get',
    params
  })

export const startOrStopApps = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/startorstop',
    method: 'post',
    data: params
  })

export const deleteApps = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/delete',
    method: 'post',
    data: params
  })

export const getAppInfo = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/describe',
    method: 'get',
    params
  })

export const updateAppInfo = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/update',
    method: 'post',
    data: params
  })
export const createApp = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/create',
    method: 'post',
    data: params
  })
