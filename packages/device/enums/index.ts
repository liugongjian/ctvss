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
  DeviceFrom = 'deviceFrom',
  DeviceVendor = 'deviceVendor',
  DeviceId = 'deviceId',
  DeviceName = 'deviceName',
  PlatformName = 'platformName',
  DeviceLocalName = 'deviceLocalName',
  DeviceIp = 'deviceIp',
  DeviceIpv6 = 'deviceIpv6',
  DevicePort = 'devicePort',
  DeviceSerialNumber = 'deviceSerialNumber',
  DeviceModel = 'deviceModel',
  DeviceLongitude = 'deviceLongitude',
  DeviceLatitude = 'deviceLatitude',
  Longlat = 'longlat',
  DeviceMac = 'deviceMac',
  DevicePoleId = 'devicePoleId',
  CreateSubDevice = 'createSubDevice',
  DeviceChannelSize = 'deviceChannelSize',
  DeviceChannelNum = 'deviceChannelNum',
  DeviceStreamSize = 'deviceStreamSize',
  DeviceStreamAutoPull = 'deviceStreamAutoPull',
  DeviceStreamPullIndex = 'deviceStreamPullIndex',
  RecordTaskId = 'recordTaskId',
  Description = 'description',
  DeviceInType = 'deviceInType',
  DeviceInTypeRadio = 'deviceInTypeRadio',
  InVideoProtocol = 'inVideoProtocol',
  InViidProtocol = 'inViidProtocol',
  InVersion = 'inVersion',
  InUserName = 'inUserName',
  EhomeCert = 'ehomeCert',
  InUserId = 'inUserId',
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
  ResourceIds = 'resourceIds',
  ResourceType = 'resourceType',
  ResourceId = 'resourceId',
  AIApps = 'aIApps',
  AnalyseType = 'analyseType',
  RemainDeviceCount = 'remainDeviceCount',
  Service = 'service',
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
  Ip = 'ip',
  Port = 'port',
  DeviceStats = 'deviceStats',
  DeviceStatus = 'deviceStatus',
  Stream = 'stream',
  Streams = 'streams',
  VideoVendor = 'videoVendor',
  Gb28181Device = 'gb28181Device',
  RtmpDevice = 'rtmpDevice',
  RtspDevice = 'rtspDevice',
  EhomeDevice = 'ehomeDevice',
  OnvifDevice = 'onvifDevice',
  Ga1400Device = 'ga1400Device',
  Gb28181SipInfo = 'gb28181SipInfo',
  EhomeSipInfo = 'ehomeSipInfo',
  ErrorCode = 'errorCode',
  ErrorMsg = 'errorMsg',
  OnvifDevicevice = 'onvifDevicevice',
  Video = 'video',
  Codec = 'codec',
  IsRoleShared = 'isRoleShared',
  // 列表相关
  VideoStatus = 'videoStatus',
  ViidStatus = 'viidStatus',
  ViidId = 'viidId',
  InProtocol = 'inProtocol',
  PageNum = 'pageNum',
  PageSize = 'pageSize',
  TotalNum = 'totalNum',
  DeviceTotalSize = 'deviceTotalSize',
  ChannelName = 'channelName'
}

/**
 * 开关状态
 */
export enum StatusEnum {
  On = 'on',
  Off = 'off',
  Failed = 'failed',
  Error = 'error'
}

/**
 * 接入方式
 */
export enum DeviceInTypeEnum {
  Video = 'video',
  Viid = 'viid'
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

/**
 * 视频编码
 */
export enum Codec {
  H264 = 'h264',
  H265 = 'h265'
}

/**
 * commonLayout左侧工具栏按钮对应enum
 */
export enum ToolsEnum {
  // 设备树相关
  StreamStatus = 'streamStatus',
  SortDirectory = 'sortDirectory',
  RefreshDirectory = 'refreshDirectory',
  AddDirectory = 'addDirectory',
  EditDirectory = 'editDirectory',
  DeleteDirectory = 'deleteDirectory',
  Polling = 'polling',
  AutoPlay = 'autoPlay',
  ExportSearchResult = 'exportSearchResult',
  SetStreamNum = 'setStreamNum',
  PausePolling = 'pausePolling',
  ResumePolling = 'resumePolling',
  StopPolling = 'stopPolling',
  IntervalChange = 'intervalChange',
  AdvanceSearch = 'advanceSearch',
  ShowMore = 'showMore',
  Refresh = 'refresh',
  CloseDialog = 'closeDialog',
  // 设备列表相关
  DescribePermission = 'describePermission',
  ShowDeviceInfo = 'showDeviceInfo',
  AddDevice = 'addDevice',
  ViewDevice = 'viewDevice',
  EditDevice = 'editDevice',
  SyncDevice = 'syncDevice',
  SyncDeviceStatus = 'syncDeviceStatus',
  RefreshRouterView = 'refreshRouterView',
  ViewChannels = 'viewChannels',
  ConfigureChannels = 'ConfigureChannels',
  Export = 'export',
  ExportAll = 'exportAll',
  ExportCurrentPage = 'exportCurrentPage',
  ExportSelected = 'exportSelected',
  Import = 'import',
  ExportTemplate = 'exportTemplate',
  OperateDevices = 'operateDevices',
  MoveDevice = 'moveDevice',
  MoveDevices = 'moveDevices',
  StartDevice = 'startDevice',
  StartDevices = 'startDevices',
  StopDevices = 'stopDevices',
  StopDevice = 'stopDevice',
  StartRecord = 'startRecord',
  StopRecord = 'stopRecord',
  DeleteDevice = 'deleteDevice',
  DeleteDevices = 'deleteDevices',
  UpdateResource = 'updateResource',
  PreviewEvents = 'previewEvents',
  PreviewVideo = 'previewVideo',
  ReplayVideo = 'replayVideo',
  PreviewViid = 'previewViid',
  GoBack = 'goBack'
}

/**
 * 目录类型
 */
export enum DirectoryTypeEnum {
  Ipc = 'ipc',
  Dir = 'dir',
  Nvr = 'nvr',
  Platform = 'platform',
  Role = 'role'
}


/**
 * 轮巡状态
 */
export enum PollingStatusEnum {
  Free = 'free',
  Working = 'working',
  Pause = 'pause'
}

/**
 * 设备基本信息Tab
 */
export enum DeviceDetailTab {
  DeviceInfo = 'DeviceInfo',
  DeviceConfig = 'DeviceConfig',
  DeviceEvents = 'DeviceEvents',
  DevicePreview = 'DevicePreview',
  DeviceReplay = 'DeviceReplay',
  DeviceAi = 'DeviceAi',
  DeviceViid = 'DeviceViid'
}

/**
 * 录像类型
 */
export enum RecordType {
  Cloud = 0, // 云端
  Device = 1 // 设备本地
}