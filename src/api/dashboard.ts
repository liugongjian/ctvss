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

export const getWeeklyTrend = (params: any): Promise<any> =>
  // request({
  //   url: '',
  //   method: 'get',
  //   params
  // })
  Promise.resolve([
    { time: '12-20', type: '人员聚集', value: 20 },
    { time: '12-20', type: '未带口罩', value: 25 },
    { time: '12-20', type: '人员上访', value: 10 },
    { time: '12-21', type: '人员聚集', value: 27 },
    { time: '12-21', type: '未带口罩', value: 10 },
    { time: '12-21', type: '人员上访', value: 50 },
    { time: '12-22', type: '人员聚集', value: 65 },
    { time: '12-22', type: '未带口罩', value: 12 },
    { time: '12-22', type: '人员上访', value: 33 },
    { time: '12-23', type: '人员聚集', value: 24 },
    { time: '12-23', type: '未带口罩', value: 45 },
    { time: '12-23', type: '人员上访', value: 30 },
    { time: '12-24', type: '人员聚集', value: 34 },
    { time: '12-24', type: '未带口罩', value: 16 },
    { time: '12-24', type: '人员上访', value: 23 },
    { time: '12-25', type: '人员聚集', value: 74 },
    { time: '12-25', type: '未带口罩', value: 15 },
    { time: '12-25', type: '人员上访', value: 20 }
  ])
