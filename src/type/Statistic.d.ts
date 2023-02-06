/*
 * @Author: zhaodan zhaodan@telecom.cn
 * @Date: 2023-01-31 09:47:32
 * @LastEditors: zhaodan zhaodan@telecom.cn
 * @LastEditTime: 2023-02-03 15:47:43
 * @FilePath: /vss-user-web/src/type/Statistic.d.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface ChartInfo {
  kind?: string
  totalDeviceNum?: number
  onlineNum?: number
  label?: string
  name?: string
  data?: any
  width?: number
  height?: number
}

export interface CalendarQuery {
  deviceId: string
  month: string
}

export interface CalendarItem {
  day?: string
  status?: string
  complianceRate?: number
}

export interface CalendarListResponse {
  records: CalendarItem[]
}

export interface CalendarMissItem {
  startTime?: string;
  endTime?: string;
  missSeconds?: number;
}

export interface CalendarMissResponse {
  misses: CalendarMissItem[]
}

export interface FilterQuery{
  startTime?: string;
  endTime?: string;
  ignore?: number
}

export interface RecordMissQuery {
  deviceId?: string;
  startTime?: string;
  endTime?: string;
  ignore?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface ExportMissQuery{
  deviceId?: string;
  startTime?: string;
  endTime?: string;
  ignore?: number;
}
