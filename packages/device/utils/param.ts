import { InVideoProtocolAllowParams, DeviceTypeDenyParamsForVideo, InViidProtocolAllowParams, DeviceTypeDenyParamsForViid } from '../settings'
import { DeviceInTypeEnum, InTypeEnum } from '../enums/index'

/**
 * 判断是否通过设备类型及接入协议字段过滤
 * @param formType 表单类型
 * @param deviceType 设备类型
 * @param inProtocol 接入协议
 * @param prop 参数名
 * @returns 判断结果
 */
const checkVisible = (deviceInType, deviceType, inProtocol, prop): boolean => {
  if (deviceInType === DeviceInTypeEnum.Video) {
    return (InVideoProtocolAllowParams[inProtocol] && InVideoProtocolAllowParams[inProtocol].has(prop)) && // 根据接入协议显示接入协议字段列表中包含的
      (DeviceTypeDenyParamsForVideo[deviceType] && !DeviceTypeDenyParamsForVideo[deviceType].has(prop)) // 根据设备类型过滤掉不需要显示的字段
  }

  if (deviceInType === DeviceInTypeEnum.Viid) {
    return (InViidProtocolAllowParams[inProtocol] && InViidProtocolAllowParams[inProtocol].has(prop)) && // 根据接入协议显示接入协议字段列表中包含的
      (DeviceTypeDenyParamsForViid[deviceType] && !DeviceTypeDenyParamsForViid[deviceType].has(prop)) // 根据设备类型过滤掉不需要显示的字段
  }
}

/**
 * 视频接入form-item显示判断
 * @param deviceType 设备类型
 * @param inVideoProtocol 视频接入协议
 * @param prop 参数名
 * @return 判断结果
 */
export function checkVideoVisible(deviceType, inVideoProtocol, prop: string): boolean {
  // 接入方式
  if (this.inType === InTypeEnum.Push) {
    if ([
      'pullUrl',
      'userName',
      'password',
      'deviceStreamAutoPull',
      'deviceStreamPullIndex'
    ].includes(prop)) return false
  } else {
    if (['pushType'].includes(prop)) return false
  }

  // 是否自动拉流
  if (this.deviceStreamAutoPull === 2) {
    if (['deviceStreamPullIndex'].includes(prop)) return false
  }

  // 是否启用域名
  if (this.enableDomain === 1) {
    if (['deviceIpRequired'].includes(prop)) return false
  } else {
    if (['deviceDomain'].includes(prop)) return false
  }

  // 默认使用字典过滤
  return checkVisible(DeviceInTypeEnum.Video, deviceType, inVideoProtocol, prop)
}

/**
 * 视图接入form-item显示判断
 * @param deviceType 设备类型
 * @param inViidProtocol 视图接入协议
 * @param prop 参数名
 * @return 判断结果
 */
export function checkViidVisible(deviceType, inViidProtocol, prop: string): boolean {
  // 默认使用字典过滤
  return checkVisible(DeviceInTypeEnum.Viid, deviceType, inViidProtocol, prop)
}
