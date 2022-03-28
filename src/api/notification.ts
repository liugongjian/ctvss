import request from '@/utils/request'

export const createNotificationPolicy = (data: any): Promise<any> =>
  request({
    url: '/notification/policy/create',
    method: 'post',
    data
  })

export const editNotificationPolicy = (data: any): Promise<any> =>
  request({
    url: 'notification/policy/edit',
    method: 'post',
    data
  })

export const toggleNotificationPolicyStatus = (data: any): Promise<any> =>
  request({
    url: '/notification/policy/active',
    method: 'post',
    data
  })

export const getNotificationPolicyList = (params: any): Promise<any> =>
  request({
    url: '/notification/policy/list',
    method: 'get',
    params
  })

export const getNotificationPolicyInfo = (params: any): Promise<any> =>
  request({
    url: '/notification/plicy',
    method: 'get',
    params
  })

export const deleteNotificationPolicy = (data: any): Promise<any> =>
  request({
    url: '/notification/policy/delete',
    method: 'delete',
    data
  })

/**
 * 推送历史列表查询
 */
export const getNotificationHistory = (params: any): Promise<any> =>
  request({
    url: '/notification/record/list',
    method: 'get',
    params
  })
