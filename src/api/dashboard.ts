import request from '@/utils/request'
import axios from 'axios'

export const getFlowData = (params: any): Promise<any> =>
  axios({
    url: '/scheduler/v1/statistic/bandwidth',
    method: 'get',
    params
  })

export const getDeviceData = (params: any): Promise<any> =>
  request({
    url: '/statistics/device/date',
    method: 'get',
    params
  })

export const getDeviceTotal = (params: any): Promise<any> =>
  request({
    url: '/statistics/device/total',
    method: 'get',
    params
  })

export const getDeviceStates = (params: any): Promise<any> =>
  request({
    url: '/statistics/device',
    method: 'get',
    params
  })

export const getResourceCount = (params: any): Promise<any> =>
  request({
    url: '/resource/count',
    method: 'get',
    params
  })

export const getBandwidthStates = (params: any): Promise<any> =>
  request({
    url: '/statistics/bandwidth',
    method: 'get',
    params
  })

export const getIntegrityRate = (params: any): Promise<any> =>
  request({
    url: '/record/integrity',
    method: 'get',
    params
  })

export const getAuditList = (params: any): Promise<any> =>
  request({
    url: '/record/auditList',
    method: 'get',
    params
  })

export const getAuditTrend = (params: any): Promise<any> =>
  request({
    url: '/record/auditTrend',
    method: 'get',
    params
  })

export const getDeviceDirInfo = (params: any): Promise<any> =>
  request({
    url: '/taizhou/dir/list',
    method: 'get',
    params
  })

export const getRecordAuditEvents = (params: any): Promise<any> =>
  request({
    url: '/record/auditEvents',
    method: 'get',
    params
  })

export const getRecordAudits = (params: any): Promise<any> =>
  request({
    url: '/record/audits',
    method: 'get',
    params
  })
