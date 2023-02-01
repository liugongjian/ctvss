/*
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-01-31 10:39:56
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-02-01 10:06:27
 * @FilePath: /vss-user-web/src/api/statistic.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'
import { CalendarQuery, CalendarListResponse
} from '@/type/Statistic'

export const getStatistics = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/overview',
    method: 'get',
    params
  })

export const getRecord = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/record',
    method: 'get',
    params
  })

export const getRecordLog = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/record/log',
    method: 'get',
    params
  })

export const setRecordThreshold = (data: any = {}): Promise<any> =>
  request({
    url: '/statistics/record',
    method: 'post',
    data
  })

export const getDeviceList = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/deviceList',
    method: 'get',
    params
  })

export const exportDeviceList = (params: any = {}): Promise<any> =>
  request({
    url: '/statistics/deviceExport',
    method: 'get',
    params,
    responseType: 'blob'
  })

export const getCalendarInfo = (params: CalendarQuery): Promise<any> => request({
  url: '/statistics/deviceList',
  method: 'get',
  params
})
