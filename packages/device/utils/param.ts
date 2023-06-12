import {
  InVideoProtocolAllowParams,
  DeviceTypeDenyParamsForVideo,
  InViidProtocolAllowParams,
  DeviceTypeDenyParamsForViid,
  DirectoryTypeAllowParams,
  DeviceListToolsAllowParams,
  DeviceTableColumnAllowParams,
  DeviceTypeDenyParamsForIbox,
  ChannelEditAllowParams,
  ChannelAllowParams,
  DeviceDetailTabsAllowParams
} from '@vss/device/settings'
import { DeviceEnum, DirectoryTypeEnum, DeviceInTypeEnum, InTypeEnum, DeviceTypeEnum, InVideoProtocolEnum, InViidProtocolEnum, ToolsEnum, DeviceDetailTab, StatusEnum } from '@vss/device/enums/index'
import { InVideoProtocol as InVideoProtocolDict, InViidProtocol as InViidProtocolDict } from '@vss/device/dicts/index'

/**
 * 判断是否通过设备类型及接入协议字段过滤
 * @param formType 表单类型
 * @param deviceType 设备类型
 * @param inProtocol 接入协议
 * @param prop 参数名
 * @returns 判断结果
 */
const checkVisible = (deviceInType: DeviceInTypeEnum, deviceType: DeviceTypeEnum, inProtocol: InVideoProtocolEnum | InViidProtocolEnum, prop: DeviceEnum, isChannel?: boolean): boolean => {
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
export function checkVideoVisible(
  deviceType: DeviceTypeEnum, 
  inVideoProtocol: InVideoProtocolEnum,
  prop: DeviceEnum
): boolean {
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
  if (this.isIbox && DeviceTypeDenyParamsForIbox.has(prop as DeviceEnum)) return false

  // 编辑状态下不显示视频接入协议
  if (prop === DeviceEnum.InVideoProtocol && this.isEdit) return false

  // 编辑状态下不显示版本
  if (prop === DeviceEnum.InVersion && this.isEdit) return false

  // 过滤出子通道需要显示的字段
  if (this.deviceChannelNum > -1) {
    if (this.isEdit) {
      return (ChannelEditAllowParams[inVideoProtocol] && ChannelEditAllowParams[inVideoProtocol].has(prop)) && // 根据接入协议显示子通道字段列表中包含的
      (DeviceTypeDenyParamsForVideo[deviceType] && !DeviceTypeDenyParamsForVideo[deviceType].has(prop)) // 根据设备类型过滤掉不需要显示的字段
    } else {
      return (ChannelAllowParams[inVideoProtocol] && ChannelAllowParams[inVideoProtocol].has(prop)) && // 根据接入协议显示子通道字段列表中包含的
      (DeviceTypeDenyParamsForVideo[deviceType] && !DeviceTypeDenyParamsForVideo[deviceType].has(prop)) // 根据设备类型过滤掉不需要显示的字段
    }
  }

  // platform下设备特殊处理
  if (this.deviceFrom === DeviceTypeEnum.Platform) {
    if ([DeviceEnum.InOrgRegion, DeviceEnum.IndustryCode].includes(prop)) return false
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
export function checkTreeToolsVisible(type: string, prop: ToolsEnum, data?: any): boolean {
  let allowFlag = true

  // platform下设备及目录特殊处理
  if (data && (data.dirFrom === DeviceTypeEnum.Platform)) {
    allowFlag = ![
      ToolsEnum.AddDirectory
    ].includes(prop)
  }

  // role分享的设备及目录特殊处理
  if (data && data[DeviceEnum.IsRoleShared]) {
    allowFlag = ![
      ToolsEnum.AddDirectory,
      ToolsEnum.SortDirectory,
      ToolsEnum.EditDirectory,
      ToolsEnum.DeleteDirectory,
    ].includes(prop)
  }

  // 流状态绿点特殊处理
  if (data && (data[DeviceEnum.StreamStatus] !== StatusEnum.On) && (prop === ToolsEnum.StreamStatus)) {
    return false
  }

  return DirectoryTypeAllowParams[type] && DirectoryTypeAllowParams[type].has(prop) && allowFlag
}

/**
 * 判断设备列表及详情按钮显隐
 * @param type 目录类型
 * @param prop 参数名
 * @param data 具体数据
 * @returns 判断结果
 */
export function checkDeviceToolsVisible(type: DeviceTypeEnum | DirectoryTypeEnum, prop: ToolsEnum, data?: any): boolean {
  let allowFlag = true
  // 不同inProtocol特殊处理
  if (data) {
    const inProtocolList = data.inProtocol || []
    if (inProtocolList.length === 1) {
      // 仅接入视频
      if (Object.values(InVideoProtocolDict).includes(inProtocolList[0]) && [
        ToolsEnum.PreviewViid
      ].includes(prop)) {
        return false
      }
      // 仅接入视图
      if (Object.values(InViidProtocolDict).includes(inProtocolList[0]) && [
        ToolsEnum.PreviewVideo,
        ToolsEnum.ReplayVideo,
        ToolsEnum.StartDevice,
        ToolsEnum.StopDevice,
        ToolsEnum.StartRecord,
        ToolsEnum.StopRecord,
        ToolsEnum.UpdateResource,
        ToolsEnum.PreviewEvents
      ].includes(prop)) {
        return false
      }
    }
  }

  // nvr通道特殊处理
  if (data && data[DeviceEnum.DeviceChannelNum] > 0) {
    allowFlag = ![ToolsEnum.DeleteDevice, ToolsEnum.MoveDevice].includes(prop)
  }

  // platform下设备及目录特殊处理
  if (data && (data[DeviceEnum.DeviceFrom] === DeviceTypeEnum.Platform)) {
    allowFlag = ![
      ToolsEnum.AddDevice,
      ToolsEnum.ConfigureChannels,
      ToolsEnum.Import,
      ToolsEnum.ExportTemplate,
      ToolsEnum.OperateDevices,
      ToolsEnum.MoveDevice,
      ToolsEnum.MoveDevices
    ].includes(prop)
  }

  // role分享的设备及目录特殊处理
  if (data && data[DeviceEnum.IsRoleShared]) {
    allowFlag = ![
      ToolsEnum.AddDevice,
      ToolsEnum.ConfigureChannels,
      ToolsEnum.EditDevice,
      ToolsEnum.DeleteDevice,
      ToolsEnum.Import,
      ToolsEnum.ExportTemplate,
      ToolsEnum.OperateDevices,
      ToolsEnum.StartDevice,
      ToolsEnum.StopDevice,
      ToolsEnum.StartRecord,
      ToolsEnum.StopRecord,
      ToolsEnum.MoveDevice,
      ToolsEnum.UpdateResource
    ].includes(prop)
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
export function checkDeviceColumnsVisible(type: string, prop: DeviceEnum, inProtocol: string): boolean {
  let allowFlag = true
  // nvr列表国标ID特殊处理
  if (type === DeviceTypeEnum.Nvr && prop === DeviceEnum.OutId) {
    allowFlag = ([InVideoProtocolEnum.Gb28181] as any).includes(inProtocol)
  }

  return DeviceTableColumnAllowParams[type] && DeviceTableColumnAllowParams[type].has(prop) && allowFlag
}

/**
 * 判断设备列表及详情按钮显隐
 * @param type 目录类型
 * @param prop 参数名
 * @param data 具体数据
 * @returns 判断结果
 */
export function checkDeviceTabsVisible(type: DeviceTypeEnum | DirectoryTypeEnum, prop: DeviceDetailTab, data?: any): boolean {
  // 无视频接入特殊处理
  if (data && (!data.hasVideo)) {
    if ([
      DeviceDetailTab.DevicePreview,
      DeviceDetailTab.DeviceReplay,
      DeviceDetailTab.DeviceEvents,
      DeviceDetailTab.DeviceAi
    ].includes(prop)) {
      return false
    }
  }

  // 无视图接入特殊处理
  if (data && (!data.hasViid)) {
    if ([
      DeviceDetailTab.DeviceViid
    ].includes(prop)) {
      return false
    }
  }

  // role分享的设备及目录特殊处理
  if (data && data[DeviceEnum.IsRoleShared]) {
    console.log(prop)
    if ([
      DeviceDetailTab.DeviceConfig
    ].includes(prop)) {
      return false
    }
  }

  return DeviceDetailTabsAllowParams[type] && DeviceDetailTabsAllowParams[type].has(prop)
}

