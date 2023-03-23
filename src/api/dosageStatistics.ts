/*
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-03-15 15:24:03
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-03-22 10:20:02
 * @FilePath: /vss-user-web/src/api/dosageStatistics.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'

// 获取今日设备数
export const getDeviceStatistics = (): Promise<any> =>
  request({
    url: '/statistics/current/device',
    method: 'get'
  })

// 根据条件获取设备折线图数据
export const getDeviceHistoryStatistics = (params: any): Promise<any> =>
  request({
    url: '/statistics/history/device',
    method: 'get',
    params
  })

// 获取今日AI服务用量
export const getAIStatistics = (): Promise<any> =>
  request({
    url: '/statistics/ai/volumetoday',
    method: 'get'
  })

  // 根据条件获取AI服务用量
  export const getAIHistoryStatistics = (data: any): Promise<any> =>
  request({
    url: '/statistics/ai/volumes',
    method: 'POST',
    data
  })


