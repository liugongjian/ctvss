import request from '@/utils/request'

export const listGroup = (data: any): Promise<any> =>
  request({
    url: '/face/listGroup',
    method: 'post',
    data
  })

export const addGroup = (data: any): Promise<any> =>
  request({
    url: '/face/addGroup',
    method: 'post',
    data
  })

export const deleteGroup = (data: any): Promise<any> =>
  request({
    url: '/face/deleteGroup',
    method: 'post',
    data
  })

export const editGroup = (data: any): Promise<any> =>
  request({
    url: '/face/editGroup',
    method: 'post',
    data
  })

export const listPerson = (data: any): Promise<any> =>
  request({
    url: '/face/listPerson',
    method: 'post',
    data
  })

export const addPerson = (data: any): Promise<any> =>
  request({
    url: '/face/addPerson',
    method: 'post',
    data
  })

export const deletePerson = (data: any): Promise<any> =>
  request({
    url: '/face/deletePerson',
    method: 'post',
    data
  })

export const editPerson = (data: any): Promise<any> =>
  request({
    url: '/face/editPerson',
    method: 'post',
    data
  })

export const copyToGroup = (data: any): Promise<any> =>
  request({
    url: '/face/copyToGroup',
    method: 'post',
    data
  })

export const verify = (data: any): Promise<any> =>
  request({
    url: '/face/verify',
    method: 'post',
    data
  })
