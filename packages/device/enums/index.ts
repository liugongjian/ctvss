
/**
 * 设备字段名
 */
export enum DeviceEnum {
  Region = 'region',
  InNetworkType = 'inNetworkType',
  OutNetworkType = 'outNetworkType',
  Device = 'device',
  Videos = 'videos',
  Viids = 'viids',
  Industry = 'industry',
  DirId = 'dirId',
  ParentDeviceId = 'parentDeviceId',
  DeviceType = 'deviceType',
  DeviceVendor = 'deviceVendor',
  DeviceId = 'deviceId',
  DeviceName = 'deviceName',
  DeviceLocalName = 'deviceLocalName',
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
  DeviceInType = 'deviceInType',
  InVideoProtocol = 'inVideoProtocol',
  InViidProtocol = 'inViidProtocol',
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
  PushUrl = 'pushUrl',
  PullUrl = 'pullUrl',
  OnlyPullUrl = 'onlyPullUrl',
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
  Resources = 'resources',
  Resource = 'resource',
  OrderResource = 'orderResource',
  OrderAIApp = 'orderAIApp',
  WorkOrderId = 'orkOrderId',
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
  SipTransType = 'sipTransType',
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
  LowerApsId = 'lowerApsId',
  ProtocolDeviceType = 'protocolDeviceType',
  Ip = 'ip',
  Port = 'port',
  DeviceStats = 'deviceStats',
  DeviceStatus = 'deviceStatus',
  Stream = 'stream',
  VideoVendor = 'videoVendor', // 用于RTSP对应视频接入的厂商，如果是“其他”需要手动填入拉流地址
  Gb28181Devices = 'Gb28181Devices',
  RtmpDevice = 'RtmpDevice',
  RtspDevice = 'RtspDevice',
  EhomeDevice = 'EhomeDevice',
  OnvifDevicevice = 'OnvifDevicevice',
  Ga1400Device = 'Ga1400Device',
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
 * 设备类型
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
 * 协议版本
 */
export enum InVersionEnum {
  Gb2016 = '2016',
  Ehome2 = '2.0'
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
export enum InNetworkTypeEnum {
  Public = 'public',
  Private = 'private'
}

/**
 * 播放网络类型
 */
export enum OutNetworkTypeEnum {
  Public = 'public',
  Private = 'private'
}
