/*
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-15 15:24:03
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-15 16:46:52
 * @FilePath: /vss-user-web/src/api/dosageStatistics.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'

export const getDeviceStatistics = (): Promise<any> =>
  request({
    url: '/statistics/current/device',
    method: 'get'
  })


export const getDeviceHistoryStatistics = (params: any): Promise<any> =>
  request({
    url: '/statistics/history/device',
    method: 'get',
    params
  })