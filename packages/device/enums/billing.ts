/**
 * 服务配置模式
 */
export enum ConfigModeEnum {
  Create = 'creat',
  Edit = 'edit',
  View = 'view'
}

/**
 * 计费
 */
 export enum BillingEnum {
  BillingMode = 'billingMode',
  RecordStream = 'recordStream',
  RecordTemplateId = 'recordTemplateId',
  RecordTemplateName = 'recordTemplateName',
  ResourceId = 'resourceId',
  Resource = 'resource'
}

/**
 * 计费模式
 */
export enum BillingModeEnum {
  Packages = 'packages',
  OnDemand = 'onDemand',
  UnBinding = 'unBinding'
}

/**
 * 计费包
 */
export enum PackagesEnum {
  ResourceId = 'resourceId',
  TotalDeviceCount = 'totalDeviceCount',
  RemainDeviceCount = 'remainDeviceCount',
  BitRate = 'bitRate',
  StorageTime = 'storageTime',
  CreateTime = 'createTime',
  ExpireTime = 'expireTime'
}

/**
 * 资源包类型
 */
export enum ResourceTypeEnum {
  Video = 'VSS_VIDEO',
  AI = 'VSS_AI',
  Viid = 'VSS_VIID',
  StorageOD = 'VSS_STORAGE_OD',
  AIOD = 'VSS_AI_OD'
}

/**
 * ipc AI配置列表
 */
export enum IpcAiConfigEnum {
  AppId = 'AppId',
  AppName = 'AppName',
  AlgorithmName = 'algorithmName',
  AnalyseType = 'analyseType',
  AnalyseRate = 'analyseRate',
  BillingMode = 'billingMode',
  ResourceId = 'resourceId',
  RemainDeviceCount = 'remainDeviceCount',
  TotalDeviceCount = 'totalDeviceCount',
  ConfigCheckArea = 'configCheckArea',
  Status = 'status'
}

/**
 * nvr配置列表
 */
export enum NvrConfigEnum {
  ChannelNum = 'channelNum',
  ChannelName = 'channelName',
  BillingMode = 'billingMode',
  RemainDeviceCount = 'remainDeviceCount',
  TotalDeviceCount = 'totalDeviceCount',
  ResourceId = 'resourceId',
  ExpireTime = 'expireTime',
  StorageTime = 'storageTime'
}

/**
 * platform配置列表
 */
export enum PlatformConfigEnum {
  DeviceName = 'deviceName',
  DeviceId = 'deviceId',
  BillingMode = 'billingMode',
  BillingId = 'billingId',
  ExpireTime = 'expireTime',
  StorageTime = 'storageTime',
  Path = 'path'
}