import request from '@/utils/request'

export const getAIConfigGroupData = (params: any): Promise<any> =>
  request({
    url: '/face/group/list',
    method: 'get',
    params
  })

export const addAIConfigGroupData = (data: any): Promise<any> =>
  request({
    url: '/face/group/create',
    method: 'post',
    data
  })

export const getGroupPersonLeft = (params: any): Promise<any> =>
  request({
    url: '/face/group/left',
    method: 'get',
    params
  })

export const getGroupPersonAlready = (params: any): Promise<any> =>
  request({
    url: '/face/group/faces',
    method: 'get',
    params
  })

export const bindGroupPerson = (data: any): Promise<any> =>
  request({
    url: '/face/group/bind',
    method: 'post',
    data
  })

export const getPersonalList = (params: any) =>
  request({
    url: '/face/list',
    method: 'get',
    params
  })

export const addPersonalInfo = (params: any) =>
  request({
    url: '/face/create',
    method: 'post',
    data: params
  })

export const deletePersonalInfo = (params: any) =>
  request({
    url: '/face/delete',
    method: 'post',
    data: params
  })
