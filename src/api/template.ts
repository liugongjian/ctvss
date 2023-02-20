import request from '@/utils/request'

// 录制模板相关接口
export const getRecordBind = (params: any): Promise<any> =>
  request({
    url: '/template/record/bind',
    method: 'get',
    params
  })

export const getRecordTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/record/list',
    method: 'get',
    params
  })

export const queryRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record',
    method: 'get',
    params
  })

export const createRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record/create',
    method: 'post',
    data: params
  })

export const getTemplateDeviceTree = (params: any): Promise<any> =>
request({
  url: '/template/record/tree',
  method: 'get',
  params
})

export const getTemplateNodeDevice = (params: any): Promise<any> =>
request({
  url: '/template/record/devices',
  method: 'get',
  params
})

export const updateRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record/update',
    method: 'post',
    data: params
  })

export const deleteRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record/delete',
    method: 'post',
    data: params
  })

// 回调模板相关接口
export const getCallbackBind = (params: any): Promise<any> =>
  request({
    url: '/template/callback/bind',
    method: 'get',
    params
  })

export const getCallbackTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/callback/list',
    method: 'get',
    params
  })

export const queryCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback',
    method: 'get',
    params
  })

export const createCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback/create',
    method: 'post',
    data: params
  })

export const updateCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback/update',
    method: 'post',
    data: params
  })

export const deleteCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback/delete',
    method: 'post',
    data: params
  })

// 截图模板相关接口
export const getSnapshotTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot/list',
    method: 'get',
    params
  })

export const querySnapshotTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot',
    method: 'get',
    params
  })

export const createSnapshotTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot/create',
    method: 'post',
    data: params
  })

export const updateSnapshotTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot/update',
    method: 'post',
    data: params
  })

export const deleteSnapshotTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/snapshot/delete',
    method: 'post',
    data: params
  })

// AI模板相关接口
export const getAIBind = (params: any): Promise<any> =>
  request({
    url: '/aimanage/airule',
    method: 'get',
    params
  })

export const getAIBindList = (params: any): Promise<any> =>
  request({
    url: '/aimanage/airule/list',
    method: 'get',
    params
  })

export const bindAITemplates = (params: any): Promise<any> =>
  request({
    url: '/aimanage/airule/create',
    method: 'post',
    data: params
  })

export const unbindAITemplates = (params: any): Promise<any> =>
  request({
    url: '/aimanage/airule/delete',
    method: 'post',
    data: params
  })

export const getAITemplates = (params: any): Promise<any> =>
  request({
    url: '/aitemplate/list',
    method: 'get',
    params
  })

export const queryAITemplate = (params: any): Promise<any> =>
  request({
    url: '/aitemplate',
    method: 'get',
    params
  })

export const createAITemplate = (params: any): Promise<any> =>
  request({
    url: '/aitemplate/create',
    method: 'post',
    data: params
  })

export const updateAITemplate = (params: any): Promise<any> =>
  request({
    url: '/aitemplate/modify',
    method: 'post',
    data: params
  })

export const deleteAITemplate = (params: any): Promise<any> =>
  request({
    url: '/aitemplate/delete',
    method: 'post',
    data: params
  })

// AI能力相关接口
export const getAIAbilityList = (params: any): Promise<any> =>
  request({
    url: '/aimanage/aiabilitys/list',
    method: 'get',
    params
  })

export const getAbilityAlgorithmList = (params: any): Promise<any> =>
  request({
    url: '/aimanage/aiability',
    method: 'get',
    params
  })

// 告警模板相关接口
export const getAlertTemplates = (params: any): Promise<any> =>
  request({
    url: '/alarmtemplates/describe',
    method: 'get',
    params
  })

export const getAlertTemplateDetails = (params: any): Promise<any> =>
  request({
    url: '/alarmtemplate/describe',
    method: 'get',
    params
  })

export const createAlertTemplate = (params: any): Promise<any> =>
  request({
    url: '/alarmtemplate/create',
    method: 'post',
    data: params
  })

export const updateAlertTemplate = (params: any): Promise<any> =>
  request({
    url: '/alarmtemplate/modify',
    method: 'post',
    data: params
  })

export const deleteAlertTemplate = (params: any): Promise<any> =>
  request({
    url: '/alarmtemplate/delete',
    method: 'post',
    data: params
  })

export const bindAlertTemplates = (params: any): Promise<any> =>
  request({
    url: '/alarm/alarmrule/create',
    method: 'post',
    data: params
  })

export const unbindAlertTemplates = (params: any): Promise<any> =>
  request({
    url: '/alarm/alarmrule/delete',
    method: 'post',
    data: params
  })

export const getAlertBind = (params: any): Promise<any> =>
  request({
    url: '/alarm/alarmrule/describeAlarmRule',
    method: 'get',
    params
  })

export const getAlertBindList = (params: any): Promise<any> =>
  request({
    url: '/alarm/alarmrule/describeAlarmRules',
    method: 'get',
    params
  })

// export const getAlertBind = (params: any): Promise<any> =>
//   request({
//     url: '/alarm/alarmrule/describeAlarmRules',
//     method: 'get',
//     params
//   })