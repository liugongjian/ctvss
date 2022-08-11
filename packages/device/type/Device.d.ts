export interface Device {
  deviceId: number;
  deviceName: string;
  groupId?: number;
  groupName?: string;
  deviceStatus?: string;
  streamStatus?: string;
  deviceType?: string;
  deviceVendor?: string;
  deviceIp?: string;
  devicePort?: number;
  gbId?: string;
  gbRegion?: string;
  gbRegionNames?: Array<string>;
  industryCode?: string;
  networkCode?: string;
  gbAccount?: string;
  tunnelNum?: number | null;
  createSubDevice?: number;
  parentDeviceId?: string;
  dirId?: string;
  sipTransType?: string;
  streamTransType?: string;
  transPriority?: string;
  createdTime?: string;
  recordStatus?: number;
  recordTaskId?: string;
  tags?: string;
  inType?: string;
  inProtocol?: string;
  streamNum?: number;
  channelNum?: number;
  channelSize?: number;
  apeId?: string;
  deviceClass?: string
}

export interface DeviceAddress {
  code: string;
  level: string;
}
