import request from '@/utils/request'

export const getAlarmRules = (params: any): Promise<any> =>
  request({
    url: '/alarm/alarmrule/describeAlarms',
    method: 'get',
    params
  })
