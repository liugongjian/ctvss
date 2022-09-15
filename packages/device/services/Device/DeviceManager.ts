/**
 * 设备管理器
 */
import Device from './Device'
import DeviceTree from './DeviceTree'
import DeviceScreen from './DeviceScreen'

export default {
  ...Device,
  ...DeviceTree,
  ...DeviceScreen
}
