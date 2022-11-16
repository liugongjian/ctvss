import request from '@/utils/request'

export const getAlarmRules = (params: any): Promise<any> =>
  request({
    url: '/alarm/info/list',
    method: 'get',
    params
  })

export const deleteAlarmInfo = (data: any): Promise<any> =>
  request({
    url: '/alarm/info/delete',
    method: 'post',
    data
  })
