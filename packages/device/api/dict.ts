import request from '@/utils/request'

export const getIndustryList = (params: any): Promise<any> =>
  request({
    url: '/gbcode/industry/list',
    method: 'get',
    params
  })

export const getNetworkList = (params: any): Promise<any> =>
  request({
    url: '/gbcode/network/list',
    method: 'get',
    params
  })

export const translateIndustry = (params: any): Promise<any> =>
  request({
    url: '/gbcode/industry',
    method: 'get',
    params
  })

export const translateNetwork = (params: any): Promise<any> =>
  request({
    url: '/gbcode/network',
    method: 'get',
    params
  })

export const translateOrgRegion = (params: any): Promise<any> =>
  request({
    url: '/gbcode/org/region',
    method: 'get',
    params
  })

export const translateResourceRegion = (params: any): Promise<any> =>
  request({
    url: '/gbcode/resource/region',
    method: 'get',
    params
  })
