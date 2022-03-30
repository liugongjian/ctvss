
import { DeviceAddress } from '@/type/device'

export interface AdvancedSearch {
  deviceStatusKeys?: Array<string>;
  streamStatusKeys?: Array<string>;
  deviceAddresses?: DeviceAddress;
  matchKeys?: Array<string>;
  inputKey?: string;
  searchKey?: string;
  revertSearchFlag?: boolean;
}