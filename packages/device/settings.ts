import { InVideoProtocol, DeviceType } from './enums'

/**
 * 根据设备接入协议需要显示的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const InVideoProtocolAllowParams = {
  [InVideoProtocol.Gb28181]: new Set([
    'inUserName',
    'deviceStreamAutoPull',
    'resources',
    'deviceChannelSize',
    'onlineChannels',
    'deviceIp',
    'devicePort',
    'outId',
    'devicePoleId',
    'deviceMac',
    'deviceSerialNumber',
    'deviceModel',
    'sipTransType',
    'deviceStreamAutoPull',
    'transPriority',
    'streamTransType',
    'gb28181SipInfo'
  ]),
  [InVideoProtocol.Ehome]: new Set([
    'inVersion',
    'deviceChannelSize',
    'deviceStreamSize',
    'deviceStreamAutoPull',
    'deviceStreamPullIndex',
    'streamTransProtocol',
    'resources',
    'deviceIp',
    'devicePort',
    'deviceMac',
    'ehomeSipInfo'
  ]),
  [InVideoProtocol.Rtsp]: new Set([
    'deviceIp',
    'devicePort',
    'deviceStreamAutoPull',
    'deviceStreamSize',
    'deviceStreamPullIndex',
    'transPriority'
  ]),
  [InVideoProtocol.Rtmp]: new Set([])
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
    'deviceModel'
  ])
}
