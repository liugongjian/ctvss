// 视图库字段 | 设备字段 转换
export enum ViewLib2Device {
  latitude = 'deviceLatitude', // 经度
  longitude = 'deviceLongitude', // 纬度
  name = 'deviceName', // 设备名
  deviceType = 'deviceType', // 设备类型
  dirId = 'dirId', // 目录ID
  placeCode = 'gbRegion', // 设备地址编码
  groupId = 'groupId', // 业务组ID
  orgCode = 'industryCode', // 行业编码
  gbDeviceId = 'deviceId', // 设备ID
  model = 'deviceVendor' // 设备型号
}

// 设备字段 | 视图库字段 转换
export enum Device2ViewLib {
  deviceLatitude = 'latitude', // 经度
  deviceLongitude = 'longitude', // 纬度
  deviceName = 'name', // 设备名
  deviceType = 'deviceType', // 设备类型
  dirId = 'dirId', // 目录ID
  gbRegion = 'placeCode', // 设备地址编码
  groupId = 'groupId', // 业务组ID
  industryCode = 'orgCode', // 行业编码
  deviceId = 'gbDeviceId', // 设备ID
  deviceVendor = 'model' // 设备型号
}
