// v2转换v1接口字典
export const ApiMapping = {
  // OpenAPI
  '/aksk/list': '/openapi/list',
  '/aksk/create': '/openapi/create',
  '/aksk/delete': '/openapi/delete',
  '/aksk/start': '/openapi/start',
  '/aksk/stop': '/openapi/stop',
  '/aksk/export': '/openapi/exportAkskOption',
  // 电子地图
  '/map/list': '/map/DescribeMaps',
  '/map/create': '/map/CreateMap:get',
  '/map/delete': '/map/DeleteMap:get',
  '/map/update': '/map/ModifyMap:get',
  '/map/describeMarkers': '/map/DescribeMapMarkers',
  '/map/mark': '/map/MarkOnMap',
  '/map/reMark': '/map/ReMarkOnMap',
  '/map/unMark': '/map/UnMarkOnMap',
  // 告警模板
  '/alarm/template/create': '/alarmtemplate/create',
  '/alarm/template/delete': '/alarmtemplate/delete',
  '/alarm/template/describe': '/alarmtemplate/describe',
  '/alarm/template/list': '/alarmtemplates/describe',
  '/alarm/template/update': '/alarmtemplate/modify',
  '/alarm/rule/create': '/alarm/alarmrule/create',
  '/alarm/rule/delete': '/alarm/alarmrule/delete',
  '/alarm/rule/describe': '/alarm/alarmrule/describeAlarmRule',
  '/alarm/rule/list': '/alarm/alarmrule/describeAlarmRules',
  // 录制模板批量操作
  '/device/batchBind': '/device/record/batchBind',
  '/device/batchUnbind': '/device/record/batchUnbind',
  // PTZ 云台控制
  '/ptz/keepwatch/describe': '/ptz/keepwatch',
  '/ptz/keepwatch/start': '/ptz/startDeviceKeepwatch',
  // 国标告警
  '/alarm/info/list': '/alarm/alarmrule/describeAlarms',
  '/alarm/info/delete': '/alarm/alarmrule/deleteAlarmInfo:get',
}
