import { InVideoProtocolEnum, InViidProtocolEnum, DeviceTypeEnum } from './enums'

/**
 * 接入协议对应的视频接入字段
 * 仅用在创建设备
 */
export const InVideoProtocolCreateParams = {
  [InVideoProtocolEnum.Gb28181]: new Set([
    'inUserName',
    'deviceStreamAutoPull',
    'outId',
    'deviceMac',
    'devicePoleId',
    'deviceSerialNumber',
    'deviceModel'
  ]),
  [InVideoProtocolEnum.Ehome]: new Set([
    'inVersion',
    'deviceStreamSize',
    'deviceStreamAutoPull',
    'deviceStreamPullIndex',
    'streamTransProtocol',
    'deviceMac'
  ]),
  [InVideoProtocolEnum.Rtsp]: new Set([
    'inType',
    'pullUrl',
    'userName',
    'password',
    'enableDomain',
    'deviceDomain',
    'deviceIpRequired',
    'devicePortRequired',
    'deviceStreamSize',
    'deviceStreamAutoPull',
    'deviceStreamPullIndex',
    'pushType',
    'streamTransProtocol'
  ]),
  [InVideoProtocolEnum.Rtmp]: new Set([
    'inType',
    'pullUrl',
    'deviceStreamAutoPull',
    'pushType',
    'tags'
  ])
}

/**
 * 根据视频接入协议需要显示的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const InVideoProtocolAllowParams = {
  [InVideoProtocolEnum.Gb28181]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Gb28181],
    'resources',
    'deviceChannelSize',
    'onlineChannels',
    'videoShowMore',
    'deviceModel',
    'sipTransType',
    'streamTransProtocol',
    'streamTransType',
    'gb28181SipInfo',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ]),
  [InVideoProtocolEnum.Ehome]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Ehome],
    'deviceChannelSize',
    'resources',
    'videoShowMore',
    'ehomeSipInfo',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ]),
  [InVideoProtocolEnum.Rtsp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Rtsp],
    'deviceChannelSize',
    'videoVendor',
    'resources',
    'deviceStreamSize',
    'transPriority',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ]),
  [InVideoProtocolEnum.Rtmp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocolEnum.Rtmp],
    'onlyPullUrl',
    'resources',
    'videoShowMore',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ])
}

/**
 * 根据设备类型视频接入需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const DeviceTypeDenyParamsForVideo = {
  [DeviceTypeEnum.Ipc]: new Set([
    'deviceChannelSize',
    'onlineChannels'
  ]),
  [DeviceTypeEnum.Nvr]: new Set([
    'devicePoleId',
    'deviceSerialNumber',
    'deviceModel'
  ]),
  [DeviceTypeEnum.Platform]: new Set([
    'deviceChannelSize',
    'onlineChannels',
    'deviceSerialNumber',
    'deviceModel',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ])
}

/**
 * 根据视频接入协议需要显示的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const InViidProtocolAllowParams = {
  [InViidProtocolEnum.Ga1400]: new Set([
    'apsId',
    'protocolDeviceType',
    'inUserName',
    'ip',
    'port'
  ])
}

/**
 * 根据设备类型视图接入需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const DeviceTypeDenyParamsForViid = {
  [DeviceTypeEnum.Ipc]: new Set([
    'apsId',
    'ip',
    'port'
  ]),
  [DeviceTypeEnum.Nvr]: new Set([
    'apsId',
    'ip',
    'port'
  ]),
  [DeviceTypeEnum.Platform]: new Set([
  ])
}
