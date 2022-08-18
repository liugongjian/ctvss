import { VideoInProtocolType, DeviceType } from './enums'

export const videoInProtocolTypeAllowParams = {
  [VideoInProtocolType.Gb28181]: new Set([
    'outId',
    'inUserName',
    'deviceChannelSize'
  ])
}

export const deviceTypeDenyParams = {
  [DeviceType.Ipc]: new Set([
    'deviceChannelSize'
  ]),
  [DeviceType.Nvr]: new Set([])
}
