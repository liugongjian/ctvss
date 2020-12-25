import request from '@/utils/request'

export const getFlowData = (params: any): Promise<any> =>
  // request({
  //   url: 'http://101.91.194.232:8090/scheduler/v1/statistic/bandwidth?StartTime=2020-12-25%2000:00:00&EndTime=2020-12-25%2023:00:00',
  //   method: 'get',
  //   params
  // })
  Promise.resolve([
    { time: '2020-12-05 10:53:13', type: 'InFlow', value: 1033 },
    { time: '2020-12-05 10:53:13', type: 'OutFlow', value: 1024 },
    { time: '2020-12-05 10:53:16', type: 'InFlow', value: 1038 },
    { time: '2020-12-05 10:53:16', type: 'OutFlow', value: 1014 },
    { time: '2020-12-05 10:53:33', type: 'InFlow', value: 923 },
    { time: '2020-12-05 10:53:43', type: 'OutFlow', value: 24 },
    { time: '2020-12-05 10:53:56', type: 'InFlow', value: 138 },
    { time: '2020-12-05 10:53:56', type: 'OutFlow', value: 214 }
  ])
  