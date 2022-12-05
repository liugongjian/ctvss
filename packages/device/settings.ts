import { DeviceEnum, InVideoProtocolEnum, InViidProtocolEnum, DeviceTypeEnum, ToolsEnum, DeviceDetailTab, DirectoryTypeEnum } from './enums'

/**
 * ==============================================================================================================================
 * DEVICE-CREATE-VIDEO
 */

/**
 * 接入协议对应的视频接入字段
 * 仅用在创建设备
 */
export const InVideoProtocolCreateParams = {
  [InVideoProtocolEnum.Gb28181]: new Set([
    DeviceEnum.InVideoProtocol,
    DeviceEnum.InVersion,
    DeviceEnum.InUserName,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.StreamTransProtocol,
    DeviceEnum.DeviceModel,
    DeviceEnum.DeviceSerialNumber,
    DeviceEnum.DeviceMac,
    DeviceEnum.DevicePoleId,
    DeviceEnum.OutId
  ]),
  [InVideoProtocolEnum.Ehome]: new Set([
    DeviceEnum.InVideoProtocol,
    DeviceEnum.InVersion,
    DeviceEnum.DeviceStreamSize,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.DeviceStreamPullIndex,
    DeviceEnum.StreamTransProtocol,
    DeviceEnum.DeviceMac
  ]),
  [InVideoProtocolEnum.Rtsp]: new Set([
    DeviceEnum.InVideoProtocol,
    DeviceEnum.InType,
    DeviceEnum.PullUrl,
    DeviceEnum.UserName,
    DeviceEnum.Password,
    DeviceEnum.EnableDomain,
    DeviceEnum.DeviceDomain,
    DeviceEnum.Ip,
    DeviceEnum.Port,
    DeviceEnum.DeviceStreamSize,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.DeviceStreamPullIndex,
    DeviceEnum.PushType,
    DeviceEnum.StreamTransProtocol
  ]),
  [InVideoProtocolEnum.Rtmp]: new Set([
    DeviceEnum.InVideoProtocol,
    DeviceEnum.InType,
    DeviceEnum.PullUrl,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.PushType,
    DeviceEnum.Tags
  ])
}

/**
 * 根据视频接入协议需要显示的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const InVideoProtocolAllowParams = {
  [InVideoProtocolEnum.Gb28181]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Gb28181],
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.Resource,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.OnlineChannels,
    DeviceEnum.SipTransType,
    DeviceEnum.StreamTransType,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    DeviceEnum.Gb28181SipInfo,
    DeviceEnum.Viids,
    DeviceEnum.DeviceName,
    DeviceEnum.DeviceType,
    DeviceEnum.DeviceId,
    DeviceEnum.InNetworkType,
    DeviceEnum.DeviceLongitude,
    DeviceEnum.Region,
    DeviceEnum.IndustryCode,
    DeviceEnum.NetworkCode,
    DeviceEnum.InOrgRegion,
    DeviceEnum.DeviceVendor,
    DeviceEnum.Description,
    DeviceEnum.PlatformName,
    DeviceEnum.VideoStatus,
    DeviceEnum.CreatedTime,
    DeviceEnum.DeviceStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.Bitrate,
    DeviceEnum.ErrorMsg
  ]),
  [InVideoProtocolEnum.Ehome]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Ehome],
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.OnlineChannels,
    DeviceEnum.Resource,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    DeviceEnum.EhomeSipInfo,
    DeviceEnum.Viids,
    DeviceEnum.DeviceName,
    DeviceEnum.DeviceType,
    DeviceEnum.DeviceId,
    DeviceEnum.InNetworkType,
    DeviceEnum.DeviceLongitude,
    DeviceEnum.Region,
    DeviceEnum.IndustryCode,
    DeviceEnum.NetworkCode,
    DeviceEnum.InOrgRegion,
    DeviceEnum.DeviceVendor,
    DeviceEnum.Description,
    DeviceEnum.VideoStatus,
    DeviceEnum.CreatedTime,
    DeviceEnum.DeviceStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.Bitrate,
    DeviceEnum.ErrorMsg
  ]),
  [InVideoProtocolEnum.Rtsp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Rtsp],
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.OnlineChannels,
    DeviceEnum.DeviceStreamSize,
    DeviceEnum.Resource,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    DeviceEnum.VideoVendor,
    DeviceEnum.Viids,
    DeviceEnum.DeviceName,
    DeviceEnum.DeviceType,
    DeviceEnum.DeviceId,
    DeviceEnum.InNetworkType,
    DeviceEnum.DeviceLongitude,
    DeviceEnum.Region,
    DeviceEnum.IndustryCode,
    DeviceEnum.NetworkCode,
    DeviceEnum.InOrgRegion,
    DeviceEnum.DeviceVendor,
    DeviceEnum.Description,
    DeviceEnum.VideoStatus,
    DeviceEnum.CreatedTime,
    DeviceEnum.DeviceStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.Bitrate,
    DeviceEnum.ErrorMsg
  ]),
  [InVideoProtocolEnum.Rtmp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Rtmp],
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.Resource,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    DeviceEnum.OnlyPullUrl,
    DeviceEnum.Viids,
    DeviceEnum.PushUrl,
    DeviceEnum.DeviceName,
    DeviceEnum.DeviceType,
    DeviceEnum.DeviceId,
    DeviceEnum.InNetworkType,
    DeviceEnum.DeviceLongitude,
    DeviceEnum.Region,
    DeviceEnum.IndustryCode,
    DeviceEnum.NetworkCode,
    DeviceEnum.InOrgRegion,
    DeviceEnum.DeviceVendor,
    DeviceEnum.Description,
    DeviceEnum.DeviceStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.Bitrate,
    DeviceEnum.ErrorMsg
  ])
}

/**
 * 根据接入协议显示子通道需要显示的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const ChannelEditAllowParams = {
  [InVideoProtocolEnum.Gb28181]: new Set([
    DeviceEnum.ChannelName,
    DeviceEnum.DeviceChannelNum,
    DeviceEnum.DeviceId,
    DeviceEnum.DeviceLongitude,
    DeviceEnum.DeviceVendor,
    DeviceEnum.DeviceSerialNumber,
    DeviceEnum.DeviceModel,
    DeviceEnum.DevicePoleId,
    DeviceEnum.Description,
    DeviceEnum.Resource
  ]),
  [InVideoProtocolEnum.Ehome]: new Set([
    DeviceEnum.ChannelName,
    DeviceEnum.DeviceChannelNum,
    DeviceEnum.DeviceId,
    DeviceEnum.DeviceLongitude,
    DeviceEnum.DeviceVendor,
    DeviceEnum.Description,
    DeviceEnum.Resource
  ]),
  [InVideoProtocolEnum.Rtsp]: new Set([
    DeviceEnum.ChannelName,
    DeviceEnum.DeviceChannelNum,
    DeviceEnum.DeviceId,
    DeviceEnum.DeviceLongitude,
    DeviceEnum.DeviceVendor,
    DeviceEnum.Description,
    DeviceEnum.Resource
  ])
}

/**
 * 根据接入协议显示子通道需要显示的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const ChannelAllowParams = {
  [InVideoProtocolEnum.Gb28181]: new Set([
    ...ChannelEditAllowParams[InVideoProtocolEnum.Gb28181],
    DeviceEnum.DeviceStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.Bitrate,
    DeviceEnum.ErrorMsg,
    DeviceEnum.OutId,
    DeviceEnum.InUserName,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.SipTransType,
    DeviceEnum.StreamTransProtocol,
    DeviceEnum.StreamTransType,
    DeviceEnum.Gb28181SipInfo
  ]),
  [InVideoProtocolEnum.Ehome]: new Set([
    ...ChannelEditAllowParams[InVideoProtocolEnum.Ehome],
    DeviceEnum.DeviceStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.Bitrate,
    DeviceEnum.ErrorMsg,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.DeviceStreamSize,
    DeviceEnum.DeviceStreamPullIndex,
    DeviceEnum.EhomeSipInfo
  ]),
  [InVideoProtocolEnum.Rtsp]: new Set([
    ...ChannelEditAllowParams[InVideoProtocolEnum.Rtsp],
    DeviceEnum.DeviceStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.Bitrate,
    DeviceEnum.ErrorMsg,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.DeviceStreamSize,
    DeviceEnum.DeviceStreamPullIndex,
    DeviceEnum.StreamTransProtocol,
    DeviceEnum.StreamTransType
  ])
}

/**
 * 根据设备类型视频接入需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const DeviceTypeDenyParamsForVideo = {
  [DeviceTypeEnum.Ipc]: new Set([
    DeviceEnum.PlatformName,
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.OnlineChannels,
    DeviceEnum.CreatedTime
  ]),
  [DeviceTypeEnum.Nvr]: new Set([
    DeviceEnum.PlatformName,
    DeviceEnum.DeviceInType,
    DeviceEnum.DevicePoleId,
    DeviceEnum.DeviceSerialNumber,
    DeviceEnum.DeviceModel,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.Bitrate
  ]),
  [DeviceTypeEnum.Platform]: new Set([
    DeviceEnum.DeviceName,
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.OnlineChannels,
    DeviceEnum.DeviceMac,
    DeviceEnum.DevicePoleId,
    DeviceEnum.DeviceSerialNumber,
    DeviceEnum.DeviceModel,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort
  ])
}

/**
 * IBOX设备需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const DeviceTypeDenyParamsForIbox = new Set([
  DeviceEnum.DeviceInType,
  DeviceEnum.DeviceInTypeRadio,
  DeviceEnum.Region,
  DeviceEnum.Resource,
  DeviceEnum.Viids
])

/**
 * ==============================================================================================================================
 * DEVICE-CREATE--VIID
 */

/**
 * 接入协议对应的视图接入字段
 * 仅用在创建设备
 */
export const InViidProtocolCreateParams = {
  [InViidProtocolEnum.Ga1400]: new Set([
    DeviceEnum.Viids,
    DeviceEnum.OutId,
    DeviceEnum.DeviceType,
    DeviceEnum.InUserId,
    DeviceEnum.Ip,
    DeviceEnum.Port
  ])
}

/**
 * 根据视图接入协议需要显示的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const InViidProtocolAllowParams = {
  [InViidProtocolEnum.Ga1400]: new Set([
    ...InViidProtocolCreateParams[InViidProtocolEnum.Ga1400],
    DeviceEnum.DeviceName,
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.DeviceType,
    DeviceEnum.DeviceId,
    DeviceEnum.InNetworkType,
    DeviceEnum.DeviceLongitude,
    DeviceEnum.Region,
    DeviceEnum.IndustryCode,
    DeviceEnum.NetworkCode,
    DeviceEnum.InOrgRegion,
    DeviceEnum.DeviceVendor,
    DeviceEnum.Description,
    DeviceEnum.PlatformName,
    DeviceEnum.CreatedTime,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort
  ])
}

/**
 * 根据设备类型视图接入需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const DeviceTypeDenyParamsForViid = {
  [DeviceTypeEnum.Ipc]: new Set([
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.PlatformName,
    DeviceEnum.OutId,
    DeviceEnum.Ip,
    DeviceEnum.Port
  ]),
  [DeviceTypeEnum.Nvr]: new Set([
    DeviceEnum.DeviceInType,
    DeviceEnum.PlatformName,
    DeviceEnum.OutId,
    DeviceEnum.Ip,
    DeviceEnum.Port
  ]),
  [DeviceTypeEnum.Platform]: new Set([
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceName,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort
  ])
}


/**
 * ==============================================================================================================================
 * DEVICE-TREE-TOOLS
 */

/**
 * 根据目录类型需要显示的字段
 */
export const DirectoryTypeAllowParams = {
  [DirectoryTypeEnum.Ipc]: new Set([
    ToolsEnum.StreamStatus,
    ToolsEnum.SetStreamNum
  ]),
  [DirectoryTypeEnum.Dir]: new Set([
    ToolsEnum.SortDirectory,
    ToolsEnum.AddDirectory,
    ToolsEnum.EditDirectory,
    ToolsEnum.DeleteDirectory,
    ToolsEnum.ShowMore
  ]),
  [DirectoryTypeEnum.Nvr]: new Set([
    ToolsEnum.SortDirectory,
    ToolsEnum.ShowMore
  ]),
  [DirectoryTypeEnum.Platform]: new Set([
    ToolsEnum.SortDirectory,
    ToolsEnum.ShowMore
  ]),
  [DirectoryTypeEnum.Role]: new Set([
    ToolsEnum.ShowMore
  ])
}

/**
 * ==============================================================================================================================
 * DEVICE-LIST
 */
export const DeviceListToolsAllowParams = {
  [DirectoryTypeEnum.Dir]: new Set([
    // Tools相关
    ToolsEnum.AddDevice,
    ToolsEnum.DeleteDevice,
    ToolsEnum.SyncDeviceStatus,
    ToolsEnum.Export,
    ToolsEnum.ExportAll,
    ToolsEnum.ExportCurrentPage,
    ToolsEnum.ExportSelected,
    ToolsEnum.Import,
    ToolsEnum.ExportTemplate,
    ToolsEnum.OperateDevices,
    ToolsEnum.StartDevices,
    ToolsEnum.StopDevices,
    ToolsEnum.DeleteDevices,
    ToolsEnum.MoveDevices,
    ToolsEnum.UpdateResource,
    ToolsEnum.PreviewEvents,
    ToolsEnum.PreviewVideo,
    ToolsEnum.ReplayVideo
  ]),
  [DirectoryTypeEnum.Ipc]: new Set([
    ToolsEnum.AddDevice,
    ToolsEnum.ViewDevice,
    ToolsEnum.EditDevice,
    ToolsEnum.DeleteDevice,
    ToolsEnum.SyncDeviceStatus,
    ToolsEnum.Export,
    ToolsEnum.ExportAll,
    ToolsEnum.ExportCurrentPage,
    ToolsEnum.ExportSelected,
    ToolsEnum.Import,
    ToolsEnum.ExportTemplate,
    ToolsEnum.OperateDevices,
    ToolsEnum.StartDevice,
    ToolsEnum.StopDevice,
    ToolsEnum.StartRecord,
    ToolsEnum.StopRecord,
    ToolsEnum.MoveDevice,
    ToolsEnum.UpdateResource,
    ToolsEnum.PreviewEvents,
    ToolsEnum.PreviewVideo,
    ToolsEnum.ReplayVideo,
    ToolsEnum.PreviewViid
  ]),
  [DirectoryTypeEnum.Nvr]: new Set([
    ToolsEnum.ShowDeviceInfo,
    ToolsEnum.ViewDevice,
    ToolsEnum.EditDevice,
    ToolsEnum.DeleteDevice,
    ToolsEnum.SyncDeviceStatus,
    ToolsEnum.ViewChannels,
    ToolsEnum.ConfigureChannels,
    ToolsEnum.Export,
    ToolsEnum.ExportAll,
    ToolsEnum.ExportCurrentPage,
    ToolsEnum.ExportSelected,
    ToolsEnum.OperateDevices,
    ToolsEnum.MoveDevice,
    ToolsEnum.StartDevices,
    ToolsEnum.StopDevices,
    ToolsEnum.UpdateResource,
    ToolsEnum.PreviewEvents
  ]),
  [DirectoryTypeEnum.Platform]: new Set([
    ToolsEnum.ShowDeviceInfo,
    ToolsEnum.ViewDevice,
    ToolsEnum.EditDevice,
    ToolsEnum.DeleteDevice,
    ToolsEnum.DeleteDevices,
    ToolsEnum.SyncDevice,
    ToolsEnum.SyncDeviceStatus,
    ToolsEnum.Export,
    ToolsEnum.ExportAll,
    ToolsEnum.ExportCurrentPage,
    ToolsEnum.MoveDevice,
    ToolsEnum.StartDevices,
    ToolsEnum.StopDevices,
    ToolsEnum.UpdateResource
  ]),
  [DirectoryTypeEnum.Role]: new Set([
    ToolsEnum.SyncDeviceStatus,
    ToolsEnum.Export,
    ToolsEnum.ExportAll,
    ToolsEnum.ExportCurrentPage
  ])
}

export const DeviceTableColumnAllowParams = {
  [DirectoryTypeEnum.Dir]: new Set([
    DeviceEnum.DeviceInType,
    DeviceEnum.InProtocol,
    DeviceEnum.DeviceType,
    DeviceEnum.InProtocol,
    DeviceEnum.VideoStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.ViidStatus,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.DeviceVendor,
    DeviceEnum.CreatedTime
  ]),
  [DirectoryTypeEnum.Nvr]: new Set([
    DeviceEnum.DeviceChannelNum,
    DeviceEnum.InProtocol,
    DeviceEnum.VideoStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.DeviceVendor,
    DeviceEnum.OutId,
    DeviceEnum.CreatedTime
  ]),
  [DirectoryTypeEnum.Platform]: new Set([
    DeviceEnum.DeviceInType,
    DeviceEnum.InProtocol,
    DeviceEnum.DeviceType,
    DeviceEnum.InProtocol,
    DeviceEnum.VideoStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.ViidStatus,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.DeviceVendor,
    DeviceEnum.CreatedTime
  ]),
  [DirectoryTypeEnum.Role]: new Set([
    DeviceEnum.DeviceInType,
    DeviceEnum.InProtocol,
    DeviceEnum.DeviceType,
    DeviceEnum.InProtocol,
    DeviceEnum.VideoStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.ViidStatus,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.DeviceVendor,
    DeviceEnum.CreatedTime
  ])
}

/**
 * ==============================================================================================================================
 * DEVICE-DETAIL
 */
 export const DeviceDetailTabsAllowParams = {
  [DirectoryTypeEnum.Ipc]: new Set([
    DeviceDetailTab.DeviceInfo,
    DeviceDetailTab.DeviceConfig,
    DeviceDetailTab.DeviceEvents,
    DeviceDetailTab.DevicePreview,
    DeviceDetailTab.DeviceReplay,
    DeviceDetailTab.DeviceAi,
    DeviceDetailTab.DeviceViid
  ]),
  [DirectoryTypeEnum.Nvr]: new Set([
    DeviceDetailTab.DeviceInfo,
    DeviceDetailTab.DeviceConfig,
    DeviceDetailTab.DeviceEvents,
    DeviceDetailTab.DeviceAi
  ]),
  [DirectoryTypeEnum.Platform]: new Set([
    DeviceDetailTab.DeviceInfo,
    DeviceDetailTab.DeviceConfig,
    DeviceDetailTab.DeviceEvents
  ]),
  [DirectoryTypeEnum.Role]: new Set([
    DeviceDetailTab.DeviceInfo,
    DeviceDetailTab.DeviceEvents
  ])
}
