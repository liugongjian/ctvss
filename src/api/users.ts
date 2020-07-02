import request from '@/utils/request'

export const getUsers = (params: any) =>
  request({
    url: '/users',
    method: 'get',
    params
  })

export const getUserInfo = (data: any) =>
  request({
    url: '/users/info',
    method: 'post',
    data
  }).catch(() => ({
    data: {
      user: {
        roles: ['admin'],
        name: '龙虾狂魔',
        avatar: 'https://chafen-segen.oss-cn-hangzhou.aliyuncs.com/admin/cat.jpg?imageView2/1/w/80/h/80',
        introduction: '欢迎光临',
        email: 'ruanzhj@chinatelecom.cn'
      }
    }
  }))

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
    url: '/users/login',
    method: 'post',
    data
  }).catch(() => {
    return {
      data: {
        accessToken: 'XXXXXXXXXXX'
      }
    }
  })

export const logout = () =>
  request({
    url: '/users/logout',
    method: 'post'
  })

export const register = (data: any) =>
  request({
    url: '/users/register',
    method: 'post',
    data
  })
