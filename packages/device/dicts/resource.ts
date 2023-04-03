import { ResourceTypeEnum } from '../enums/resource'
import { BillingModeEnum } from '../enums/billing'
/*
  资源包名称
*/
export const ResourceType = {
  [ResourceTypeEnum.Video]: '视频包',
  [ResourceTypeEnum.AI]: 'AI包',
  [ResourceTypeEnum.Upload]: '上行带宽包'
}

/**
 * 资源包AI类型
 */
export const ResourceAiType = {
  'AI-100': '分钟级',
  'AI-200': '秒级',
  'AI-300': '高算力型'
}

/**
 * 计费模式
 */
export const BillingModeType = {
  [BillingModeEnum.Packages]: '资源包',
  [BillingModeEnum.OnDemand]: '按需计费',
  [BillingModeEnum.UnBinding]: '停用'
}

/**
 * 录制码流(单)
 */
export const RecordStreamType = {
  '0': '无录制',
  '1': '录制'
}

/**
 * 录制码流(多)
 */
 export const RecordStreamsType = {
  '0': '无录制',
  '1': '主码流',
  '2': '子码流',
  '3': '第三码流'
}