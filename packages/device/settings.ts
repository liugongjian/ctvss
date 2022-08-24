import { DeviceEnum, InVideoProtocolEnum, InViidProtocolEnum, DeviceTypeEnum } from './enums'

/**
 * 接入协议对应的视频接入字段
 * 仅用在创建设备
 */
export const InVideoProtocolCreateParams = {
  [InVideoProtocolEnum.Gb28181]: new Set([
    DeviceEnum.InUserName,
    DeviceEnum.DeviceStreamAutoPull,
    DeviceEnum.StreamTransProtocol,
    DeviceEnum.OutId,
    DeviceEnum.DeviceMac,
    DeviceEnum.DevicePoleId,
    DeviceEnum.DeviceSerialNumber,
    DeviceEnum.DeviceModel
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
    'deviceIpRequired',
    'devicePortRequired',
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
    DeviceEnum.Resources,
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.OnlineChannels,
    DeviceEnum.DeviceModel,
    DeviceEnum.SipTransType,
    DeviceEnum.StreamTransType,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    'gb28181SipInfo',
    'videoShowMore',
    'deviceShowMore'
  ]),
  [InVideoProtocolEnum.Ehome]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Ehome],
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.Resources,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    'ehomeSipInfo',
    'videoShowMore',
    'deviceShowMore'
  ]),
  [InVideoProtocolEnum.Rtsp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Rtsp],
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.Resources,
    DeviceEnum.DeviceStreamSize,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    DeviceEnum.VideoVendor,
    'deviceShowMore'
  ]),
  [InVideoProtocolEnum.Rtmp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Rtmp],
    DeviceEnum.Resources,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    'onlyPullUrl',
    'videoShowMore',
    'deviceShowMore'
  ])
}

/**
 * 根据设备类型视频接入需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const DeviceTypeDenyParamsForVideo = {
  [DeviceTypeEnum.Ipc]: new Set([
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.OnlineChannels
  ]),
  [DeviceTypeEnum.Nvr]: new Set([
    DeviceEnum.DevicePoleId,
    DeviceEnum.DeviceSerialNumber,
    DeviceEnum.DeviceModel
  ]),
  [DeviceTypeEnum.Platform]: new Set([
    DeviceEnum.DeviceChannelSize,
    DeviceEnum.OnlineChannels,
    DeviceEnum.DeviceSerialNumber,
    DeviceEnum.DeviceModel,
    DeviceEnum.DeviceIp,
    DeviceEnum.DevicePort,
    'deviceShowMore'
  ])
}

/**
 * 接入协议对应的视图接入字段
 * 仅用在创建设备
 */
export const InViidProtocolCreateParams = {
  [InViidProtocolEnum.Ga1400]: new Set([
    'apsId',
    'protocolDeviceType',
    'inUserName',
    'ip',
    'port'
  ])
}

/**
 * 根据视频接入协议需要显示的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const InViidProtocolAllowParams = {
  [InViidProtocolEnum.Ga1400]: new Set([
    DeviceEnum.LowerApsId,
    DeviceEnum.ProtocolDeviceType,
    DeviceEnum.InUserName,
    DeviceEnum.Ip,
    DeviceEnum.Port
  ])
}

/**
 * 根据设备类型视图接入需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const DeviceTypeDenyParamsForViid = {
  [DeviceTypeEnum.Ipc]: new Set([
    DeviceEnum.LowerApsId,
    DeviceEnum.Ip,
    DeviceEnum.Port
  ]),
  [DeviceTypeEnum.Nvr]: new Set([
    DeviceEnum.LowerApsId,
    DeviceEnum.Ip,
    DeviceEnum.Port
  ]),
  [DeviceTypeEnum.Platform]: new Set([
  ])
}