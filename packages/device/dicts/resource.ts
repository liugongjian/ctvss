import { ResourceTypeEnum } from '../enums/resource'
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