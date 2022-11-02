import {
  InVideoProtocolAllowParams,
  DeviceTypeDenyParamsForVideo,
  InViidProtocolAllowParams,
  DeviceTypeDenyParamsForViid,
  DirectoryTypeAllowParams,
  DeviceListToolsAllowParams,
  DeviceTableColumnAllowParams,
  DeviceTypeDenyParamsForIbox,
  ChannelDenyEditableParams
} from '@vss/device/settings'
import { DeviceEnum, DeviceInTypeEnum, InTypeEnum, DeviceTypeEnum, InVideoProtocolEnum, InViidProtocolEnum, ToolsEnum } from '@vss/device/enums/index'
import { VisibleOptions } from '../type/Param'

/**
 * 判断是否通过设备类型及接入协议字段过滤
 * @param formType 表单类型
 * @param deviceType 设备类型
 * @param inProtocol 接入协议
 * @param prop 参数名
 * @returns 判断结果
 */
const checkVisible = (deviceInType: DeviceInTypeEnum, deviceType: DeviceTypeEnum, inProtocol: InVideoProtocolEnum | InViidProtocolEnum, prop: DeviceEnum): boolean => {
  if (deviceInType === DeviceInTypeEnum.Video) {
    return (InVideoProtocolAllowParams[inProtocol] && InVideoProtocolAllowParams[inProtocol].has(prop)) && // 根据接入协议显示接入协议字段列表中包含的
      (DeviceTypeDenyParamsForVideo[deviceType] && !DeviceTypeDenyParamsForVideo[deviceType].has(prop)) // 根据设备类型过滤掉不需要显示的字段
  }

  if (deviceInType === DeviceInTypeEnum.Viid) {
    return (InViidProtocolAllowParams[inProtocol] && InViidProtocolAllowParams[inProtocol].has(prop)) && // 根据接入协议显示接入协议字段列表中包含的
      (DeviceTypeDenyParamsForViid[deviceType] && !DeviceTypeDenyParamsForViid[deviceType].has(prop)) // 根据设备类型过滤掉不需要显示的字段
  }

  return false
}

/**
 * 视频接入form-item显示判断
 * @param deviceType 设备类型
 * @param inVideoProtocol 视频接入协议
 * @param prop 参数名
 * @param options 扩展参数 {isIbox, isEdit}
 * @return 判断结果
 */
export function checkVideoVisible(deviceType: DeviceTypeEnum, inVideoProtocol: InVideoProtocolEnum, prop: DeviceEnum, options: VisibleOptions = { isIbox: false, isEdit: false }): boolean {
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
  if (options.isIbox && DeviceTypeDenyParamsForIbox.has(prop as DeviceEnum)) return false

  // 默认使用字典过滤
  return checkVisible(DeviceInTypeEnum.Video, deviceType, inVideoProtocol, prop)
}

/**
 * 视频接入form-item是否禁用状态
 * @param prop 参数名
 * @param options 扩展参数 {isIbox, isEdit}
 * @return 判断结果
 */
 export function checkFormDisable(prop, options: VisibleOptions = { isEdit: false }): boolean {
    // 通道编辑页面部分组件不可编辑
    if (this[DeviceEnum.DeviceChannelNum] > 0 && options.isEdit) {
      return ChannelDenyEditableParams.has(prop)
    }
    // 编辑状态下禁用视频接入协议的修改
    if (prop === DeviceEnum.InVideoProtocol && options.isEdit) {
      return true
    }
    return false
 }

/**
 * 视图接入form-item显示判断
 * @param deviceType 设备类型
 * @param inViidProtocol 视图接入协议
 * @param prop 参数名
 * @return 判断结果
 */
export function checkViidVisible(deviceType: DeviceTypeEnum, inViidProtocol: InViidProtocolEnum, prop: DeviceEnum): boolean {
  // 默认使用字典过滤
  return checkVisible(DeviceInTypeEnum.Viid, deviceType, inViidProtocol, prop)
}

/**
 * 判断common-layout左侧目录树工具栏显隐
 * @param type 目录类型
 * @param prop 参数名
 * @returns 判断结果
 */
export function checkTreeToolsVisible(type: string, prop: DeviceEnum): boolean {
  return DirectoryTypeAllowParams[type] && DirectoryTypeAllowParams[type].has(prop)
}

/**
 * 判断设备列表按钮显隐
 * @param type 目录类型
 * @param prop 参数名
 * @param data 具体数据
 * @returns 判断结果
 */
export function checkDeviceListVisible(type: string, prop: ToolsEnum, data?: any): boolean {
  let allowFlag = true
  // nvr通道特殊处理
  if (data && data[DeviceEnum.DeviceChannelNum] > 0) {
    allowFlag = ![ToolsEnum.DeleteDevice, ToolsEnum.MoveDevice].includes(prop)
  }

  // platform特殊处理
  if (type === DeviceTypeEnum.Platform) {
    allowFlag = ![ToolsEnum.DeleteDevice, ToolsEnum.MoveDevice].includes(prop)
  }

  // ConfigureChannels仅供ehome使用
  if (prop === ToolsEnum.ConfigureChannels && type === DeviceTypeEnum.Nvr) {
    return data && data[DeviceEnum.InProtocol] === InVideoProtocolEnum.Ehome
  }
  return DeviceListToolsAllowParams[type] && DeviceListToolsAllowParams[type].has(prop) && allowFlag
}

/**
 * 判断设备列表按钮显隐
 * @param type 目录类型
 * @param prop 参数名
 * @returns 判断结果
 */
export function checkDeviceColumnsVisible(type: string, prop: DeviceEnum): boolean {
  return DeviceTableColumnAllowParams[type] && DeviceTableColumnAllowParams[type].has(prop)
}
