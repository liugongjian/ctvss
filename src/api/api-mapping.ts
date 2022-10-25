// v1转换v2接口字典
export const ApiMapping = {
  // OpenAPI
  '/openapi/list': '/aksk/list',
  '/openapi/create': '/aksk/create',
  '/openapi/delete': '/aksk/delete',
  '/openapi/start': '/aksk/start',
  '/openapi/stop': '/aksk/stop',
  '/openapi/exportAkskOption': '/aksk/exportAkskOption',
  // 电子地图
  '/map/DescribeMaps': '/map/list',
  // '/map/CreateMap': '/map/create',
  '/map/DeleteMap': '/map/delete',
  '/map/ModifyMap': '/map/modify',
  '/map/DescribeMapMarkers': '/map/describeMarkers',
  '/map/MarkOnMap': '/map/mark',
  '/map/ReMarkOnMap': '/map/reMark',
  '/map/UnMarkOnMap': '/map/unMark'
}