import {
  InVideoProtocolAllowParams,
  DeviceTypeDenyParamsForVideo,
  InViidProtocolAllowParams,
  DeviceTypeDenyParamsForViid,
  DirectoryTypeAllowParams,
  DeviceListToolsAllowParams,
  DeviceTableColumnAllowParams,
  DeviceTypeDenyParamsForIbox
} from '@vss/device/settings'
import { DeviceEnum, DeviceInTypeEnum, InTypeEnum } from '@vss/device/enums/index'

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
 * @param isIbox 是否为IBOX类型
 * @param prop 参数名
 * @return 判断结果
 */
export function checkVideoVisible(deviceType, inVideoProtocol, isIbox = false, prop: string): boolean {
  if (!this) {
    throw new Error('请使用call()将this指向video info')
  }

  // 接入方式
  if (this.inType === InTypeEnum.Push) {
    if ([
      DeviceEnum.PullUrl as string,
      DeviceEnum.UserName as string,
      DeviceEnum.Password as string,
      DeviceEnum.DeviceStreamAutoPull as string,
      DeviceEnum.DeviceStreamPullIndex as string
    ].includes(prop)) return false
  } else {
    if ([DeviceEnum.PushType as string].includes(prop)) return false
  }

  // 是否自动拉流
  if (this.deviceStreamAutoPull === 2) {
    if ([DeviceEnum.DeviceStreamPullIndex as string].includes(prop)) return false
  }

  // 是否启用域名
  if (this.enableDomain === 1) {
    if ([DeviceEnum.Ip as string].includes(prop)) return false
  } else {
    if ([DeviceEnum.DeviceDomain as string].includes(prop)) return false
  }

  // 过滤IBOX的字段
  if (isIbox && DeviceTypeDenyParamsForIbox.has(prop as DeviceEnum)) return false

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

/**
 * 判断common-layout左侧目录树工具栏显隐
 * @param type 目录类型
 * @param prop 参数名
 * @returns 判断结果
 */
export function checkTreeToolsVisible(type: string, prop: string): boolean {
  return DirectoryTypeAllowParams[type] && DirectoryTypeAllowParams[type].has(prop)
}

/**
 * 判断设备列表按钮显隐
 * @param type 目录类型
 * @param prop 参数名
 * @returns 判断结果
 */
export function checkDeviceListVisible(type: string, prop: string): boolean {
  return DeviceListToolsAllowParams[type] && DeviceListToolsAllowParams[type].has(prop)
}

/**
 * 判断设备列表按钮显隐
 * @param type 目录类型
 * @param prop 参数名
 * @returns 判断结果
 */
export function checkDeviceColumnsVisible(type: string, prop: string): boolean {
  return DeviceTableColumnAllowParams[type] && DeviceTableColumnAllowParams[type].has(prop)
}
