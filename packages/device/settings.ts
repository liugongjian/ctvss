import { InVideoProtocol, DeviceType } from './enums'

/**
 * 根据设备接入协议需要显示的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const InVideoProtocolAllowParams = {
  [InVideoProtocol.Gb28181]: new Set([
    'outId',
    'inVersion',
    'inUserName',
    'resources',
    'deviceStreamAutoPull',
    'deviceChannelSize',
    'onlineChannels',
    'videoShowMore',
    'devicePoleId',
    'deviceMac',
    'deviceSerialNumber',
    'deviceModel',
    'sipTransType',
    'deviceStreamAutoPull',
    'transPriority',
    'streamTransType',
    'gb28181SipInfo',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ]),
  [InVideoProtocol.Ehome]: new Set([
    'inVersion',
    'inUserName',
    'deviceChannelSize',
    'deviceStreamSize',
    'deviceStreamAutoPull',
    'deviceStreamPullIndex',
    'streamTransProtocol',
    'resources',
    'videoShowMore',
    'deviceMac',
    'ehomeSipInfo',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ]),
  [InVideoProtocol.Rtsp]: new Set([
    'deviceChannelSize',
    'inType',
    'videoVendor',
    'pullUrl',
    'userName',
    'password',
    'enableDomain',
    'deviceDomain',
    'deviceIpRequired',
    'devicePortRequired',
    'deviceStreamAutoPull',
    'deviceStreamPullIndex',
    'pushType',
    'streamTransProtocol',
    'resources',
    'deviceStreamSize',
    'transPriority',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ]),
  [InVideoProtocol.Rtmp]: new Set([
    'inType',
    'onlyPullUrl',
    'pullUrl',
    'deviceStreamAutoPull',
    'pushType',
    'resources',
    'videoShowMore',
    'tags',
    'deviceShowMore',
    'deviceIp',
    'devicePort'
  ])
}

/**
 * 根据设备类型需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const deviceTypeDenyParams = {
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
