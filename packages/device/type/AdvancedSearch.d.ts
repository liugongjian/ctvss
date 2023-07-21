import { DeviceAddress } from './Device'

export interface AdvancedSearch {
  deviceStatusKeys?: Array<string>
  viidStatusKeys?: Array<string>
  streamStatusKeys?: Array<string>
  deviceAddresses?: DeviceAddress
  matchKeys?: Array<string>
  inProtocolKey?: string
  inputKey?: string
  searchKey?: string
  revertSearchFlag?: boolean
}
