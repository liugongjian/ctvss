import request from '@/utils/request'

interface LogParams {
  deviceId: string;
  inProtocol: string;
  operationName: string;
}

export const getOptLog = (params: any): Promise<any> =>
  request({
    url: '/logs',
    method: 'get',
    params
  })

export const getOptLogById = (params: any): Promise<any> =>
  request({
    url: '/logs',
    method: 'get',
    params
  })

export const getOptName = (): Promise<any> =>
  request({
    url: '/operationNames',
    method: 'get'
  })

/**
 * 添加操作日志
 * @param params LogParams
 */
export const addLog = (params: LogParams): Promise<any> =>
  request({
    url: '/log/add',
    method: 'post',
    data: params
  })
