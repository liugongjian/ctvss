import request from '@/utils/request'

export const getUsers = (params: any) =>
  request({
    url: '/users',
    method: 'get',
    params
  })

export const getMainUserInfo = () =>
  request({
    url: '/user',
    method: 'get'
  })

export const getIAMUserInfo = (params: any) =>
  request({
    url: '/iam/user',
    method: 'get',
    params
  })

export const getIAMUserMergedPolicies = (data: any) =>
  request({
    url: '/iam/user/mergedPolicy',
    method: 'post',
    data
  })

export const getUserByName = (username: string) =>
  request({
    url: `/users/${username}`,
    method: 'get'
  })

export const updateUser = (username: string, data: any) =>
  request({
    url: `/users/${username}`,
    method: 'put',
    data
  })

export const deleteUser = (username: string) =>
  request({
    url: `/users/${username}`,
    method: 'delete'
  })

export const login = (data: any) =>
  request({
    url: '/user/login',
    method: 'post',
    data
  })

export const logout = () =>
  request({
    url: '/user/logout',
    method: 'post'
  })

export const changePassword = (data: any) =>
  request({
    url: 'iam/user/changePwd',
    method: 'post',
    data
  })

export const resetIAMPassword = (data: any) =>
  request({
    url: 'iam/user/reset',
    method: 'post',
    data
  })

export const register = (data: any) =>
  request({
    url: '/users/register',
    method: 'post',
    data
  })

export const changeIAMPassword = (data: any) =>
  request({
    url: 'iam/user/directReset',
    method: 'post',
    data
  })

/**
 * 查询用户配置
 */
export const getUserConfig = (): Promise<any> =>
  request({
    url: '/user/config',
    method: 'get'
  })

/**
 * 保存用户配置
 */
export const updatetUserConfig = (data: any): Promise<any> =>
  request({
    url: '/user/config/createOrUpdate',
    method: 'post',
    data
  })

/**
 * 获取验证码
 */
export const getCaptcha = (): Promise<any> =>
  request({
    url: '/user/captcha',
    method: 'get'
  })
