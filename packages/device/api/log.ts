import request from '@/utils/request'

export const saveLogs = (data: any) =>
  request({
    url: '/vss-web-performance-agent',
    method: 'post',
    data
  })
