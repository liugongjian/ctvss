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
  OnDemand = 'onDemand'
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
  AI = 'VSS_AI'
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
  Remain = 'remain',
  RemainZones = 'remainZones'
}

/**
 * nvr配置列表
 */
export enum NvrConfigEnum {
  DeviceChannelNum = 'deviceChannelNum',
  ChannelName = 'channelName',
  BillingMode = 'billingMode',
  Remain = 'remain',
  ExpireTime = 'expireTime',
  StorageTime = 'storageTime'
}

/**
 * platform配置列表
 */
 export enum PlatformConfigEnum {
  DeviceName = 'deviceName',
  BillingMode = 'billingMode',
  BillingId = 'billingId',
  ExpireTime = 'expireTime',
  StorageTime = 'storageTime'
}