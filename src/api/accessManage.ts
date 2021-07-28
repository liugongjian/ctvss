import request from '@/utils/request'

export const createUser = (params: any): Promise<any> =>
  request({
    url: '/iam/user/create',
    method: 'post',
    data: params
  })

export const deleteUser = (params: any): Promise<any> =>
  request({
    url: '/iam/user/delete',
    method: 'post',
    data: params
  })

export const modifyUser = (params: any): Promise<any> =>
  request({
    url: '/iam/user/modify',
    method: 'post',
    data: params
  })

export const getUser = (params: any): Promise<any> =>
  request({
    url: '/iam/user',
    method: 'get',
    params
  })

export const getUserList = (params: any): Promise<any> =>
  request({
    url: '/iam/user/list',
    method: 'get',
    params
  })

export const createGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group/create',
    method: 'post',
    data: params
  })

export const deleteGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group/delete',
    method: 'post',
    data: params
  })

export const modifyGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group/modify',
    method: 'post',
    data: params
  })

export const getGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group',
    method: 'get',
    params
  })

export const combineGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/group/combine',
    method: 'post',
    data: params
  })

export const getGroupList = (params: any): Promise<any> =>
  request({
    url: '/iam/group/list',
    method: 'get',
    params
  })

export const addToGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/user/addToGroup',
    method: 'post',
    data: params
  })

export const delFromGroup = (params: any): Promise<any> =>
  request({
    url: '/iam/user/delFromGroup',
    method: 'post',
    data: params
  })

export const getPolicyList = (params: any): Promise<any> =>
  request({
    url: '/iam/policy/list',
    method: 'get',
    params
  })

export const iamCreateRole = (params: any): Promise<any> =>
  request({
    url: '/iam/role/create',
    method: 'post',
    data: params
  })

export const iamModifyRole = (params: any): Promise<any> =>
  request({
    url: '/iam/role/modify',
    method: 'post',
    data: params
  })

export const iamGetRole = (params: any): Promise<any> =>
  request({
    url: '/iam/role',
    method: 'get',
    params
  })

export const iamDeleteRole = (params: any): Promise<any> =>
  request({
    url: '/iam/role/delete',
    method: 'post',
    data: params
  })

export const getIamRoleList = (params: any): Promise<any> =>
  request({
    url: '/iam/role/list',
    method: 'get',
    params
  })

export const getUserRoleList = (params: any): Promise<any> =>
  request({
    url: '/iam/role/authorized/list',
    method: 'get',
    params
  })

export const switchUserRole = (data: any): Promise<any> =>
  request({
    url: '/iam/role/switch',
    method: 'post',
    data
  })

export const exitUserRole = (): Promise<any> =>
  request({
    url: '/iam/role/exit',
    method: 'post'
  })
