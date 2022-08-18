import { videoInProtocolTypeAllowParams, deviceTypeDenyParams } from '../settings'

export const checkVisible = (deviceType, inVideoProtocol, prop) => {
  return videoInProtocolTypeAllowParams[inVideoProtocol].has(prop) &&
          !deviceTypeDenyParams[deviceType].has(prop)
}
