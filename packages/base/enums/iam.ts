/**
 * 权限策略
 */
export enum PolicyEnum {
  GetDevice = 'ivs:GetDevice',
  DeleteDevice = 'ivs:DeleteDevice',
  UpdateDevice = 'ivs:UpdateDevice',
  CreateDevice = 'ivs:CreateDevice',
  GetLiveStream = 'ivs:GetLiveStream',
  ControlDevicePTZ = 'ivs:ControlDevicePTZ',
  LockDevicePTZ = 'ivs:LockDevicePTZ',
  ControlDevicePreset = 'ivs:ControlDevicePreset',
  GetCloudRecord = 'ivs:GetCloudRecord',
  GetDeviceRecord = 'ivs:GetDeviceRecord',
  DownloadCloudRecord = 'ivs:DownloadCloudRecord',
  LockCloudRecord = 'ivs:LockCloudRecord',
  GetApp = 'ivs:GetApp',
  AdminApp = 'ivs:AdminApp',
  GetMap = 'ivs:GetMap',
  GetDashboard = 'ivs:GetDashboard',
  AdminCar = 'ivs:AdminCar'
}
