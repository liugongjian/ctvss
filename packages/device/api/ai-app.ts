import request from '@/utils/request'

export const getAbilityList = (): Promise<any> =>
  request({
    url: '/ai/aiAbility/describelist',
    method: 'get'
  })

export const getAppList = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/describelist',
    method: 'get',
    params
  })
