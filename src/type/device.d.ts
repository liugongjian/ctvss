export interface Device {
  deviceId: number;
  deviceName: string;
  groupId? :number;
  groupName?: string;
  deviceStatus?: string;
  streamStatus?: string;
  deviceType?: string;
  deviceVendor: string;
  deviceIp?: string;
  devicePort?: number;
  gbId?: string;
  gbAccount?: string;
  tunnelNum?: number | null;
  createSubDevice?: number;
  parentDeviceId?: string;
  dirId?: string;
}
