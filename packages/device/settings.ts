import { VideoInProtocolType, DeviceType } from './enums'

/**
 * 根据设备类型需要隐藏的字段
 * 注意下面是显示的字段(ALLOW)
 */
export const videoInProtocolTypeAllowParams = {
  [VideoInProtocolType.Gb28181]: new Set([
    'deviceChannelSize',
    'inUserName',
    'deviceStreamAutoPull',
    'resources',
    'deviceIp',
    'devicePort',
    'outId',
    'devicePoleId',
    'deviceMac',
    'deviceSerialNumber',
    'deviceModel'
  ]),
  [VideoInProtocolType.Ehome]: new Set([
    'inVersion',
    'deviceChannelSize',
    'deviceStreamSize',
    'deviceStreamAutoPull',
    'deviceStreamPullIndex',
    'streamTransProtocol',
    'resources',
    'deviceIp',
    'devicePort',
    'deviceMac'
  ]),
  [VideoInProtocolType.Rtsp]: new Set([]),
  [VideoInProtocolType.Rtmp]: new Set([])
}

/**
 * 根据设备类型需要隐藏的字段
 * 注意下面是不显示的字段(DENY)
 */
export const deviceTypeDenyParams = {
  [DeviceType.Ipc]: new Set([
    'deviceChannelSize'
  ]),
  [DeviceType.Nvr]: new Set([
    'devicePoleId',
    'deviceSerialNumber',
    'deviceModel'
  ]),
  [DeviceType.Platform]: new Set([
    'deviceChannelSize',
    'deviceSerialNumber',
    'deviceModel'
  ])
}
