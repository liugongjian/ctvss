import { DeviceEnum, InVideoProtocolEnum, InViidProtocolEnum, DeviceTypeEnum, ToolsEnum, DirectoryTypeEnum } from './enums'
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
    DeviceEnum.InVersion,
    DeviceEnum.DeviceStreamSize,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.DeviceStreamPullIndex,
    DeviceEnum.StreamTransProtocol,
    DeviceEnum.DeviceMac
  ]),
  [InVideoProtocolEnum.Rtsp]: new Set([
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
    DeviceEnum.PlatformName,
    DeviceEnum.VideoStatus,
    DeviceEnum.CreatedTime
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
    DeviceEnum.VideoStatus,
    DeviceEnum.CreatedTime
  ]),
  [InVideoProtocolEnum.Rtsp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Rtsp],
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.Resource,
    DeviceEnum.DeviceStreamSize,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    DeviceEnum.VideoVendor,
    DeviceEnum.Viids
  ]),
  [InVideoProtocolEnum.Rtmp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Rtmp],
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.Resource,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    DeviceEnum.OnlyPullUrl,
    DeviceEnum.Viids
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
    DeviceEnum.DeviceModel
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
    DeviceEnum.InUserName,
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
    DeviceEnum.DeviceInType,
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.InVersion,
    DeviceEnum.InUserName,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.StreamTransProtocol,
  ])
}

/**
 * 根据设备类型视图接入需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const DeviceTypeDenyParamsForViid = {
  [DeviceTypeEnum.Ipc]: new Set([
    DeviceEnum.DeviceInTypeRadio,
    DeviceEnum.OutId,
    DeviceEnum.Ip,
    DeviceEnum.Port
  ]),
  [DeviceTypeEnum.Nvr]: new Set([
    DeviceEnum.DeviceInType,
    DeviceEnum.OutId,
    DeviceEnum.Ip,
    DeviceEnum.Port
  ]),
  [DeviceTypeEnum.Platform]: new Set([
    DeviceEnum.DeviceInType
  ])
}


/**
 * 子通道不能编辑的字段
 */
export const ChannelDenyEditableParams = new Set([
  DeviceEnum.InVideoProtocol,
  DeviceEnum.InVersion,
  DeviceEnum.InUserName,
  DeviceEnum.DeviceStreamAutoPull,
  DeviceEnum.StreamTransProtocol
])

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
    ToolsEnum.ReplayVideo
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
    DeviceEnum.DeviceVendor
  ]),
  [DirectoryTypeEnum.Nvr]: new Set([
    DeviceEnum.DeviceChannelNum,
    DeviceEnum.InProtocol,
    DeviceEnum.VideoStatus,
    DeviceEnum.StreamStatus,
    DeviceEnum.RecordStatus,
    DeviceEnum.DeviceVendor
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
    DeviceEnum.DeviceVendor
  ])
}
