import request from '@/utils/request'

// 开始对讲
export const startTalk = (params: any): Promise<any> =>
  request({
    url: '/device/talk/start',
    method: 'get',
    params
  })

// 结束对讲
export const stopTalk = (params: any): Promise<any> =>
  request({
    url: '/device/talk/stop',
    method: 'get',
    params
  })
