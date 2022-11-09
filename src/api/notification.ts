import request from '@/utils/request'

/**
 * 创建消息推送策略
 */
export const createNotificationPolicy = (data: any): Promise<any> =>
  request({
    url: '/notification/policy/create',
    method: 'post',
    data
  })

/**
 * 编辑消息推送策略
 */
export const editNotificationPolicy = (data: any): Promise<any> =>
  request({
    url: '/notification/policy/edit',
    method: 'post',
    data
  })

/**
 * 启用/停用消息推送策略
 */
export const toggleNotificationPolicyStatus = (data: any): Promise<any> =>
  request({
    url: '/notification/policy/active',
    method: 'post',
    data
  })

/**
 * 消息推送策略列表查询
 */
export const getNotificationPolicyList = (data: any): Promise<any> =>
  request({
    url: '/notification/policy/list',
    method: 'post',
    data
  })

/**
 * 查询消息推送策略
 */
export const getNotificationPolicyInfo = (params: any): Promise<any> =>
  request({
    url: '/notification/policy',
    method: 'get',
    params
  })

/**
 * 删除消息推送策略
 */
export const deleteNotificationPolicy = (data: any): Promise<any> =>
  request({
    url: '/notification/policy/delete',
    method: 'post',
    data
  })

/**
 * 推送历史列表查询
 */
export const getNotificationHistory = (data: any): Promise<any> =>
  request({
    url: '/notification/record/list',
    method: 'post',
    data
  })
