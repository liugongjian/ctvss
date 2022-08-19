import { InVideoProtocolAllowParams, deviceTypeDenyParams } from '../settings'

export const checkVisible = (deviceType, inVideoProtocol, prop) => {
  return InVideoProtocolAllowParams[inVideoProtocol].has(prop) && // 根据接入协议显示接入协议字段列表中包含的
          !deviceTypeDenyParams[deviceType].has(prop) // 根据设备类型过滤掉不需要显示的字段
}
