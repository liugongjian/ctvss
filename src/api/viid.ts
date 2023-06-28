import request from '@/utils/request'

/**
 * 增加上级视图库
 */
export const createViewLibUpPlatform = (params: any) =>
  request({
    url: '/viid/cascade_viids',
    method: 'post',
    data: params
  })

/**
 * 更新上级视图库
 */
export const updateViewLibUpPlatform = (params: any) =>
  request({
    url: `/viid/cascade_viids/${params[0]}`,
    method: 'put',
    data: params[1]
  })

/**
 * 启动上级视图库
 */
export const enableViewLibUpPlatform = (params: any) =>
  request({
    url: `/viid/cascade_viids/${params}/active`,
    method: 'post'
  })

/**
 * 停止上级视图库
 */
export const stopViewLibUpPlatform = (params: any) =>
  request({
    url: `/viid/cascade_viids/${params}/inactive`,
    method: 'post'
  })

/**
 * 删除上级视图库
 */
export const deleteViewLibUpPlatform = (params: any) =>
request({
  url: `/viid/cascade_viids/${params}`,
  method: 'delete'
})

/**
 * 获取上级视图库列表
 */
export const getViewLibPlatformList = (params: any) =>
  request({
    url: '/viid/cascade_viids',
    method: 'get',
    params
  })

/**
 * 获取上级视图库详情
 */
export const getViewLibPlatformDetail = (params: any) =>
  request({
    url: `/viid/cascade_viids/${params.cascadeViidId}`,
    method: 'get',
    params
  })

/**
 * 获取全部上级平台订阅列表
 */
export const getAllReceiveSubscribesList = (params: any) =>
  request({
    url: '/viid/cascade_viids_subscribes',
    method: 'get',
    params
  })

/**
 * 获取全部上级平台订阅列表V2
 */
export const getAllReceiveSubscribesListV2 = (params: any) =>
  request({
    url: '/viid/subscribes/cascade_viids',
    method: 'get',
    params
  })

/**
 * 获取单一上级平台订阅列表
 */
export const getOneReceiveSubscribesList = (params: any) =>
  request({
    url: `/viid/cascade_viids/${params.cascadeViidId}/subscribes`,
    method: 'get',
    params
  })

/**
 * 获取全部上级平台订阅列表V2
 */
export const getOneReceiveSubscribesListV2 = (params: any) =>
  request({
    url: `/viid/subscribes/cascade_viids/${params.cascadeViidId}`,
    method: 'get',
    params
  })

/**
 * 获取全部下级平台订阅列表
 */
export const getAllSendSubscribesList = (params: any) =>
  request({
    url: '/viid/lower_viids/subscribes',
    method: 'get',
    params
  })

/**
 * 获取单一下级平台订阅列表
 */
export const getOneSendSubscribesList = (params: any) =>
  request({
    url: `/viid/lower_viids/${params.cascadeViidId}/subscribes`,
    method: 'get',
    params
  })

/**
 * 查询通知统计
 */
export const getSubscribesStat = (params: any) =>
  request({
    url: `/viid/subscribes/${params.subscribeID}/stats/${params.timeInterval}`,
    method: 'get',
    params
  })

/**
 * 增加下级视图订阅
 */
export const createSubscribes = (params: any) =>
  request({
    url: '/viid/lower_viids/subscribes',
    method: 'post',
    data: params
  })

/**
 * 取消对下级视图订阅
 */
export const cancelSubscribes = (params: any) => {
  const { subscribeID, ...other } = params
  request({
    url: `/viid/lower_viids/subscribes/${subscribeID}`,
    method: 'put',
    data: other
  })
}

/**
 * 查询订阅详情
 */
export const getSubscribesDetail = (params: any) =>
  request({
    url: `viid/subscribes/${params.subscribeID}`,
    method: 'get',
    params
  })

/**
 * 查询订阅详情V2
 */
export const getSubscribesDetailV2 = (params: any) =>
  request({
    url: `viid/subscribes/describe/${params.subscribeID}`,
    method: 'get',
    params
  })

/**
 * 获取下级视图库列表
 */
export const getLowerPlatformList = (params: any) =>
  request({
    url: '/viid/lower_viids',
    method: 'get',
    params
  })

/**
 * 查询下级平台设备列表
 */
export const getLowerViidDevicesList = (params: any) =>
  request({
    url: `/viid/lower_viids/${params.viidId}/devices`,
    method: 'get',
    params
  })

/**
 * 获取区域/级联的设备列表
 */
export const getCascadeDevicesList = (params: any) =>
 request({
   url: '/viid/cascade_devices',
   method: 'get',
   params
 })
