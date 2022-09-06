/**
 * 设备字段名
 */
export enum DeviceEnum {
  Region = 'Region',
  InNetworkType = 'InNetworkType',
  OutNetworkType = 'OutNetworkType',
  Device = 'Device',
  Videos = 'Videos',
  Viids = 'Viids',
  Industry = 'Industry',
  DirId = 'DirId',
  ParentDeviceId = 'ParentDeviceId',
  DeviceType = 'DeviceType',
  DeviceVendor = 'DeviceVendor',
  DeviceId = 'DeviceId',
  DeviceName = 'DeviceName',
  DeviceLocalName = 'DeviceLocalName',
  DeviceIp = 'DeviceIp',
  DeviceIpv6 = 'DeviceIpv6',
  DevicePort = 'DevicePort',
  DeviceSerialNumber = 'DeviceSerialNumber',
  DeviceModel = 'DeviceModel',
  DeviceLongitude = 'DeviceLongitude',
  DeviceLatitude = 'DeviceLatitude',
  Longlat = 'Longlat',
  DeviceMac = 'DeviceMac',
  DevicePoleId = 'DevicePoleId',
  CreateSubDevice = 'CreateSubDevice',
  DeviceChannelSize = 'DeviceChannelSize',
  DeviceChannelNum = 'DeviceChannelNum',
  DeviceStreamSize = 'DeviceStreamSize',
  DeviceStreamAutoPull = 'DeviceStreamAutoPull',
  DeviceStreamPullIndex = 'DeviceStreamPullIndex',
  Description = 'Description',
  DeviceInType = 'DeviceInType',
  DeviceInTypeRadio = 'DeviceInTypeRadio',
  InVideoProtocol = 'InVideoProtocol',
  InViidProtocol = 'InViidProtocol',
  InVersion = 'InVersion',
  InUserName = 'InUserName',
  OutProtocol = 'OutProtocol',
  SipTransProtocol = 'SipTransProtocol',
  StreamTransProtocol = 'StreamTransProtocol',
  Id = 'Id',
  OutId = 'OutId',
  Tags = 'Tags',
  InType = 'InType',
  PushType = 'PushType',
  UserName = 'UserName',
  Password = 'Password',
  PushUrl = 'PushUrl',
  PullUrl = 'PullUrl',
  OnlyPullUrl = 'OnlyPullUrl',
  DeviceDomain = 'DeviceDomain',
  EnableDomain = 'EnableDomain',
  OrgCode = 'OrgCode',
  CapDirection = 'CapDirection',
  MonitorDirection = 'MonitorDirection',
  InIotProtocol = 'InIotProtocol',
  InOrgRegion = 'InOrgRegion',
  InOrgRegionLevel = 'InOrgRegionLevel',
  IndustryCode = 'IndustryCode',
  NetworkCode = 'NetworkCode',
  Resources = 'Resources',
  Resource = 'Resource',
  OrderResource = 'OrderResource',
  OrderAIApp = 'OrderAIApp',
  WorkOrderId = 'WorkOrderId',
  ResourceType = 'ResourceType',
  ResourceId = 'ResourceId',
  AIApps = 'AIApps',
  VssAIApps = 'VssAIApps',
  AnalyseType = 'AnalyseType',
  RemainDeviceCount = 'RemainDeviceCount',
  CreatedTime = 'CreatedTime',
  UpdatedTime = 'UpdatedTime',
  IsOnline = 'IsOnline',
  RegisterTime = 'RegisterTime',
  KeepliveTime = 'KeepliveTime',
  UnregisterTime = 'UnregisterTime',
  SipId = 'SipId',
  SipIp = 'SipIp',
  SipTcpPort = 'SipTcpPort',
  SipUdpPort = 'SipUdpPort',
  SipTransType = 'SipTransType',
  StreamNum = 'StreamNum',
  StreamStatus = 'StreamStatus',
  StreamTransType = 'StreamTransType',
  RecordStatus = 'RecordStatus',
  Bitrate = 'Bitrate',
  ChannelSize = 'ChannelSize',
  OnlineChannels = 'OnlineChannels',
  OfflineChannels = 'OfflineChannels',
  OnlineStreams = 'OnlineStreams',
  OfflineStreams = 'OfflineStreams',
  FailedStreams = 'FailedStreams',
  MaxChannelSize = 'MaxChannelSize',
  HttpEndpoint = 'HttpEndpoint',
  HttpsEndpoint = 'HttpsEndpoint',
  IncludeDeviceStats = 'IncludeDeviceStats',
  IncludeDeviceDir = 'IncludeDeviceDir',
  LowerApsId = 'LowerApsId',
  ProtocolDeviceType = 'ProtocolDeviceType',
  Ip = 'Ip',
  Port = 'Port',
  DeviceStats = 'DeviceStats',
  DeviceStatus = 'DeviceStatus',
  Stream = 'Stream',
  Streams = 'Streams',
  VideoVendor = 'VideoVendor',
  Gb28181Device = 'Gb28181Device',
  RtmpDevice = 'RtmpDevice',
  RtspDevice = 'RtspDevice',
  EhomeDevice = 'EhomeDevice',
  OnvifDevice = 'OnvifDevice',
  Ga1400Device = 'Ga1400Device',
  Gb28181SipInfo = 'Gb28181SipInfo',
  EhomeSipInfo = 'EhomeSipInfo',
  ErrorCode = 'ErrorCode',
  ErrorMsg = 'ErrorMsg',
  OnvifDevicevice = 'OnvifDevicevice',
  // 列表相关
  VideoStatus = 'VideoStatus',
  ViidStatus = 'ViidStatus',
  InProtocol = 'InProtocol',
  PageNum = 'PageNum',
  PageSize = 'PageSize',
  TotalNum = 'TotalNum',
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
  // 设备列表相关
  ShowDeviceInfo = 'showDeviceInfo',
  AddDevice = 'addDevice',
  ViewDevice = 'viewDetails',
  EditDevice = 'editDevice',
  SyncDevice = 'syncDevice',
  ViewChannels = 'viewChannels',
  Export = 'export',
  ExportAll = 'exportAll',
  ExportCurrentPage = 'exportCurrentPage',
  ExportSelected = 'exportSelected',
  Import = 'import',
  ExportTemplate = 'exportTemplate',
  OperateDevices = 'operateDevices',
  MoveDevice = 'moveDevice',
  StartDevice = 'startDevice',
  StopDevice = 'stopDevice',
  StartRecord = 'startRecord',
  StopRecord = 'stopRecord',
  DeleteDevice = 'deleteDevice',
  UpdateResource = 'updateResource',
  PreviewEvents = 'previewEvents',
  PreviewVideo = 'previewVideo',
  ReplayVideo = 'replayVideo',
  PreviewViid = 'previewViid'
}

/**
 * 目录类型
 */
export enum DirectoryTypeEnum {
  Ipc = 'ipc',
  Dir = 'dir',
  Nvr = 'nvr',
  Platform = 'platform'
}
