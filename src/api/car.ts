import request from '@/utils/request'

// 车载监控管理相关接口
export const getCarTasks = (params: any): Promise<any> =>
  request({
    url: '/vehicle/tasks',
    method: 'get',
    params
  })

export const getCarTask = (params: any): Promise<any> =>
  request({
    url: '/vehicle/task',
    method: 'get',
    params
  })

export const operateCarTask = (params: any): Promise<any> =>
  request({
    url: '/vehicle/operate',
    method: 'post',
    data: params
  })
