export interface Device {
  deviceId: number;
  deviceName: string;
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
}
