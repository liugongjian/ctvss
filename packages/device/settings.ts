import { InVideoProtocol, InViidProtocol, DeviceType } from './enums'

/**
 * 接入协议对应的视频接入字段
 * 仅用在创建设备
 */
export const InVideoProtocolCreateParams = {
  [InVideoProtocol.Gb28181]: new Set([
    'inVersion',
    'inUserName',
    'deviceStreamAutoPull',
    'streamTransProtocol',
    'outId',
    'deviceMac',
    'devicePoleId',
    'deviceSerialNumber',
    'deviceModel'
  ]),
  [InVideoProtocol.Ehome]: new Set([
    'inVersion',
    'deviceStreamSize',
    'deviceStreamAutoPull',
    'deviceStreamPullIndex',
    'streamTransProtocol',
    'deviceMac'
  ]),
  [InVideoProtocol.Rtsp]: new Set([
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
  [InVideoProtocol.Rtmp]: new Set([
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
  [InVideoProtocol.Gb28181]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocol.Gb28181],
    'resources',
    'deviceChannelSize',
    'onlineChannels',
    'videoShowMore',
    'sipTransType',
    'streamTransType',
    'gb28181SipInfo',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ]),
  [InVideoProtocol.Ehome]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocol.Ehome],
    'deviceChannelSize',
    'resources',
    'videoShowMore',
    'ehomeSipInfo',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ]),
  [InVideoProtocol.Rtsp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocol.Rtsp],
    'deviceChannelSize',
    'videoVendor',
    'resources',
    'deviceStreamSize',
    'transPriority',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ]),
  [InVideoProtocol.Rtmp]: new Set([
    ...InVideoProtocolCreateParams[InVideoProtocol.Rtmp],
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
  [DeviceType.Ipc]: new Set([
    'deviceChannelSize',
    'onlineChannels'
  ]),
  [DeviceType.Nvr]: new Set([
    'devicePoleId',
    'deviceSerialNumber',
    'deviceModel'
  ]),
  [DeviceType.Platform]: new Set([
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
 * 接入协议对应的视图接入字段
 * 仅用在创建设备
 */
export const InViidProtocolCreateParams = {
  [InViidProtocol.Ga1400]: new Set([
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
  [InViidProtocol.Ga1400]: new Set([
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
  [DeviceType.Ipc]: new Set([
    'apsId',
    'ip',
    'port'
  ]),
  [DeviceType.Nvr]: new Set([
    'apsId',
    'ip',
    'port'
  ]),
  [DeviceType.Platform]: new Set([
  ])
}
