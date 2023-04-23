import request from '@/utils/request'

export const getIamInfo = (params: any): Promise<any> =>
  request({
    url: '/iam/info/stat',
    method: 'get',
    params
  })

export const getUserDetail = (params: any): Promise<any> =>
  request({
    url: '/iam/user',
    method: 'get',
    params
  })

export const deleteUser = (params: any): Promise<any> =>
  request({
    url: '/iam/user/delete',
    method: 'post',
    data: params
  })

export const setAccessPassword = (param: any): Promise<any> =>
  request({
    url: '/iam/user/addpwd',
    method: 'post',
    data: param
  })

export const ifAccess = (): Promise<any> =>
  request({
    url: '/iam/user/pwdsetting/access',
    method: 'get'
  })