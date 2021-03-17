import request from '@/utils/request'

export const createUser = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/user/create',
    method: 'post',
    data: params
  })

export const deleteUser = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/user/delete',
    method: 'post',
    data: params
  })

export const modifyUser = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/user/modify',
    method: 'post',
    data: params
  })

export const getUser = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/user',
    method: 'get',
    params
  })

export const getUserList = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/user/list',
    method: 'get',
    params
  })

export const createGroup = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/group/create',
    method: 'post',
    data: params
  })

export const deleteGroup = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/group/delete',
    method: 'post',
    data: params
  })

export const modifyGroup = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/group/modify',
    method: 'post',
    data: params
  })

export const getGroup = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/group',
    method: 'get',
    params
  })

export const getGroupList = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/group/list',
    method: 'get',
    params
  })

export const addToGroup = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/user/addToGroup',
    method: 'post',
    data: params
  })

export const delFromGroup = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/user/delFromGroup',
    method: 'post',
    data: params
  })

export const getPolicyList = (params: any): Promise<any> =>
  request({
    url: '/v1/iam/policy/list',
    method: 'get',
    params
  })
