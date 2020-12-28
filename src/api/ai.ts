import request from '@/utils/request'

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
