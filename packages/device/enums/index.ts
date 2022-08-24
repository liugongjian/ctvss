
/**
 * 设备字段名
 */
export enum DeviceEnum {
  Region = 'region',
  InNetworkType = 'inNetworkType',
  DirId = 'dirId',
  ParentDeviceId = 'parentDeviceId',
  DeviceType = 'deviceType',
  DeviceVendor = 'deviceVendor',
  DeviceId = 'deviceId',
  DeviceName = 'deviceName',
  DeviceIp = 'deviceIp',
  DeviceIpv6 = 'deviceIpv6',
  DevicePort = 'devicePort',
  DeviceSerialNumber = 'deviceSerialNumber',
  DeviceModel = 'deviceModel',
  DeviceLongitude = 'deviceLongitude',
  DeviceLatitude = 'deviceLatitude',
  DeviceMac = 'deviceMac',
  DevicePoleId = 'devicePoleId',
  CreateSubDevice = 'createSubDevice',
  DeviceChannelSize = 'deviceChannelSize',
  DeviceChannelNum = 'deviceChannelNum',
  DeviceStreamSize = 'deviceStreamSize',
  DeviceStreamAutoPull = 'deviceStreamAutoPull',
  DeviceStreamPullIndex = 'deviceStreamPullIndex',
  Description = 'description',
  InVideoProtocol = 'inVideoProtocol',
  InVersion = 'inVersion',
  InUserName = 'inUserName',
  OutProtocol = 'outProtocol',
  SipTransProtocol = 'sipTransProtocol',
  StreamTransProtocol = 'streamTransProtocol',
  Id = 'id',
  OutId = 'outId',
  Tags = 'tags',
  InType = 'inType',
  PushType = 'pushType',
  UserName = 'userName',
  Password = 'password',
  PullUrl = 'pullUrl',
  DeviceDomain = 'deviceDomain',
  EnableDomain = 'enableDomain',
  OrgCode = 'orgCode',
  CapDirection = 'capDirection',
  MonitorDirection = 'monitorDirection',
  InIotProtocol = 'inIotProtocol',
  InOrgRegion = 'inOrgRegion',
  InOrgRegionLevel = 'inOrgRegionLevel',
  IndustryCode = 'industryCode',
  NetworkCode = 'networkCode',
  WorkOrderId = 'workOrderId',
  ResourceType = 'resourceType',
  ResourceId = 'resourceId',
  AnalyseType = 'analyseType',
  CreatedTime = 'createdTime',
  UpdatedTime = 'updatedTime',
  IsOnline = 'isOnline',
  RegisterTime = 'registerTime',
  KeepliveTime = 'keepliveTime',
  UnregisterTime = 'unregisterTime',
  SipId = 'sipId',
  SipIp = 'sipIp',
  SipTcpPort = 'sipTcpPort',
  SipUdpPort = 'sipUdpPort',
  StreamNum = 'streamNum',
  StreamStatus = 'streamStatus',
  StreamTransType = 'streamTransType',
  RecordStatus = 'recordStatus',
  Bitrate = 'bitrate',
  ChannelSize = 'channelSize',
  OnlineChannels = 'onlineChannels',
  OfflineChannels = 'offlineChannels',
  OnlineStreams = 'onlineStreams',
  OfflineStreams = 'offlineStreams',
  FailedStreams = 'failedStreams',
  MaxChannelSize = 'maxChannelSize',
  HttpEndpoint = 'httpEndpoint',
  HttpsEndpoint = 'httpsEndpoint',
  IncludeDeviceStats = 'includeDeviceStats',
  IncludeDeviceDir = 'includeDeviceDir',
  ErrorCode = 'errorCode',
  ErrorMsg = 'errorMsg'
}

/**
 * 接入方式
 */
export enum DeviceInTypeEnum {
  Video = 'video',
  Viid = 'viid',
  VideoAndViid = 'videoAndViid'
}

/**
 * 接入方式
 */
export enum DeviceTypeEnum {
  Ipc = 'ipc',
  Nvr = 'nvr',
  Platform = 'platform'
}

/**
 * 视频接入协议
 */
export enum InVideoProtocolEnum {
  Gb28181 = 'gb28181',
  Rtmp = 'rtmp',
  Rtsp = 'rtsp',
  Ehome = 'ehome',
  Onvif = 'onvif'
}

/**
 * 视图库接入协议
 */
export enum InViidProtocolEnum {
  Ga1400 = 'ga1400'
}

/**
 * 视频流接入方式
 */
export enum InTypeEnum {
  Push = 'push',
  Pull = 'pull'
}

/**
 * 接入网络类型
 */
export enum InNetworkType {
  Public = 'public',
  Private = 'private'
}
