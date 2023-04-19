import request from '@/utils/request'

/**
 * =======================================================
 * 录制模板相关接口
 * =======================================================
 */
/**
 * 查询存储模板列表V2
 */
export const getStorageTemplate = (params: any): Promise<any> =>
  request({
    url: '/viid/storage/template/list',
    method: 'get',
    params
  })

/**
 * 查询录制模板列表
 */
export const getRecordTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/record/list',
    method: 'get',
    params
  })

/**
 * 查询录制模板
 */
export const queryRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record',
    method: 'get',
    params
  })

/**
 * 创建录制模板
 */
export const createRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record/create',
    method: 'post',
    data: params
  })

/**
 * 更新录制模板
 */
export const updateRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record/update',
    method: 'post',
    data: params
  })

/**
 * 删除录制模板
 */
export const deleteRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/record/delete',
    method: 'post',
    data: params
  })

/**
 * 获取设备录制模板
 */
export const getDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record',
    method: 'get',
    params
  })

/**
* 设置设备录制模板
*/
export const setDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record/bind',
    method: 'post',
    data: params
  })

/**
* 解绑设备录制模板
*/
export const unbindDeviceRecordTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/record/unbind',
    method: 'post',
    data: params
  })

/**
 * 查询绑定关系
 */
export const getRecordBind = (params: any): Promise<any> =>
  request({
    url: '/template/record/bind',
    method: 'get',
    params
  })

/**
 * =======================================================
 * 回调模板相关接口
 * =======================================================
 */
/**
* 查询回调模板列表
*/
export const getCallbackTemplates = (params: any): Promise<any> =>
  request({
    url: '/template/callback/list',
    method: 'get',
    params
  })

/**
* 查询回调模板
*/
export const queryCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback',
    method: 'get',
    params
  })

/**
* 创建回调模板
*/
export const createCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback/create',
    method: 'post',
    data: params
  })

/**
* 更新回调模板
*/
export const updateCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback/update',
    method: 'post',
    data: params
  })

/**
* 删除回调模板
*/
export const deleteCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/template/callback/delete',
    method: 'post',
    data: params
  })

/**
* 获取设备回调模板
*/
export const getDeviceCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/callback',
    method: 'get',
    params
  })

/**
* 设置设备回调模板
*/
export const setDeviceCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/callback/bind',
    method: 'post',
    data: params
  })

/**
* 解绑设备回调模板
*/
export const unbindDeviceCallbackTemplate = (params: any): Promise<any> =>
  request({
    url: '/device/callback/unbind',
    method: 'post',
    data: params
  })

/**
* 查询回调模板绑定关系
*/
export const getCallbackBind = (params: any): Promise<any> =>
  request({
    url: '/template/callback/bind',
    method: 'get',
    params
  })

/**
 * =======================================================
 * 告警模板相关接口
 * =======================================================
 */
export const getAlertTemplates = (params: any): Promise<any> =>
  request({
    url: '/alarm/template/list',
    method: 'get',
    params
  })

export const getAlertTemplateDetails = (params: any): Promise<any> =>
  request({
    url: '/alarm/template/describe',
    method: 'get',
    params
  })

export const createAlertTemplate = (params: any): Promise<any> =>
  request({
    url: '/alarm/template/create',
    method: 'post',
    data: params
  })

export const updateAlertTemplate = (params: any): Promise<any> =>
  request({
    url: '/alarm/template/update',
    method: 'post',
    data: params
  })

export const deleteAlertTemplate = (params: any): Promise<any> =>
  request({
    url: '/alarm/template/delete',
    method: 'post',
    data: params
  })

export const bindAlertTemplates = (params: any): Promise<any> =>
  request({
    url: '/alarm/rule/create',
    method: 'post',
    data: params
  })

export const unbindAlertTemplates = (params: any): Promise<any> =>
  request({
    url: '/alarm/rule/delete',
    method: 'post',
    data: params
  })

export const getAlertBind = (params: any): Promise<any> =>
  request({
    url: '/alarm/rule/describe',
    method: 'get',
    params
  })

export const getAlertBindList = (params: any): Promise<any> =>
  request({
    url: '/alarm/rule/list',
    method: 'get',
    params
  })