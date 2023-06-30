import request from '@/utils/request'
import { UserModule } from '@/store/modules/user'

export const getAbilityList = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAbility/describelist',
    method: 'get',
    params
  })

export const getAppList = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/describelist',
    method: 'get',
    params
  })

export const getAlgorithmList = (params: any): Promise<any> =>
  request({
    url: '/ai/algorithms/describelist',
    method: 'get',
    params
  })

export const startOrStopApps = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/startorstop',
    method: 'post',
    data: params
  })

export const deleteApps = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/delete',
    method: 'post',
    data: params
  })

export const getAppInfo = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/describe',
    method: 'get',
    params
  })

export const updateAppInfo = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/update',
    method: 'post',
    data: params
  })
export const createApp = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/create',
    method: 'post',
    data: params
  })

export const getPeopleTrendChart = (params: any): Promise<any> =>
  request({
    url: '/ai/analysis/result',
    method: 'get',
    params
  })

export const getAppScreenShot = (params: any): Promise<any> =>
  request({
    url: '/ai/analysis/result/screenshot',
    method: 'get',
    params: {
      ...params,
      outNetwork: UserModule.outNetwork || undefined
    }
  })

// 获取 已编辑过的区域划线
export const getAppDescribeLine = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/describe',
    method: 'get',
    params
  })

// 提交 区域划线
export const sendAppDescribeLine = (params: any): Promise<any> =>
  request({
    url: '/ai/algorithms/configure',
    method: 'post',
    data: params
  })

// 获取视频截图接口 stream/frame
export const getAlgoStreamFrame = (params: any): Promise<any> =>
  request({
    url: '/stream/frame',
    method: 'get',
    params
  })

// 新的获取视频截图接口 stream/frame
export const getAlgoStreamFrameShot = (params: any): Promise<any> =>
  request({
    url: '/stream/framenew',
    method: 'post',
    data: params
  })

export const getAttachedDevice = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/relation',
    method: 'get',
    params
  })

export const getAiAlarm = (params: any): Promise<any> =>
  request({
    url: '/ai/result/count',
    method: 'get',
    params
  })

export const getVehiclesAlarmStatic = (params: any): Promise<any> =>
  request({
    url: '/ai/result/describevehicleschart',
    method: 'post',
    data: params
  })

export const getPhoneNumberForAISMS = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/describePhoneNumberForAISMS',
    method: 'get',
    params
  })

export const activatePhone = (params: any): Promise<any> =>
  request({
    url: '/ai/aiAPP/activatePhoneNumberForAISMS',
    method: 'get',
    params
  })

export const getAiChannels = (params: any): Promise<any> =>
  request({
    url: '/ai/stat/algos',
    method: 'get',
    params
  })

export const getAiAlarms = (params: any): Promise<any> =>
  request({
    url: '/ai/results',
    method: 'get',
    params
  })

export const getAiStats = (params: any): Promise<any> =>
  request({
    url: '/ai/stat/results',
    method: 'post',
    data: params
  })

export const getAiAlgoTypes = (params: any): Promise<any> =>
  request({
    url: '/ai/stat/results/config',
    method: 'get',
    params
  })

export const configAlgoStat = (params: any): Promise<any> =>
  request({
    url: '/ai/stat/results/config',
    method: 'post',
    data: params
  })






