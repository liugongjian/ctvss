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
    url: '/face/group/list',
    method: 'get',
    params
  })

export const bindGroupPerson = (data: any): Promise<any> =>
  request({
    url: '/face/group/bind',
    method: 'post',
    data
  })
