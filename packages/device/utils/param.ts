import { InVideoProtocolAllowParams, deviceTypeDenyParams } from '../settings'

export const checkVisible = (deviceType, inVideoProtocol, prop) => {
  return InVideoProtocolAllowParams[inVideoProtocol].has(prop) && // 根据接入协议显示接入协议字段列表中包含的
          !deviceTypeDenyParams[deviceType].has(prop) // 根据设备类型过滤掉不需要显示的字段
}

/**
 * form-item显示判断
 * @param prop 参数名
 * @return 判断结果
 */
export function checkVideoVisible(deviceType, inVideoProtocol, prop: string): boolean {
  // 接入方式
  if (this.inType === 'pull') {
    if (['pushType'].includes(prop)) return false
  } else {
    if ([
      'pullUrl',
      'userName',
      'password',
      'deviceStreamAutoPull',
      'deviceStreamPullIndex'
    ].includes(prop)) return false
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
  return checkVisible(deviceType, inVideoProtocol, prop)
}
