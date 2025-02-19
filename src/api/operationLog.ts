import request from '@/utils/request'

interface LogParams {
  deviceId: string;
  inProtocol: string;
  operationName: string;
}

export const getOptLog = (params: any, cancelToken?: any): Promise<any> =>
  request({
    url: '/logs',
    method: 'get',
    params,
    cancelToken
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

export const exportLog = (params: any): Promise<any> =>
  request({
    url: '/exportOperationLogs',
    method: 'get',
    // responseType: 'blob', //解析 excel xlsx格式数据
    params
  })
