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