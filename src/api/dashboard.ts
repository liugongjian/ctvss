import request from '@/utils/request'
import axios from 'axios'

export const getFlowData = (params: any): Promise<any> =>
  axios({
    url: '/scheduler/v1/statistic/bandwidth',
    method: 'get',
    params
  })

export const getDeviceStates = (params: any): Promise<any> =>
  request({
    url: '/statistics/device',
    method: 'get',
    params
  })
