export const AnimalType = [
  { label: 'Bear', cname: '狗熊' }
]

export const CityGovType = [
  { label: 'dianwai', cname: '店外经营' },
  { label: 'youtan', cname: '游摊小贩' },
  { label: 'zhandao', cname: '占道经营' },
  { label: 'wuliao', cname: '乱堆物料' },
  { label: 'guanggao', cname: '户外广告' },
  { label: 'dabaolaji', cname: '打包垃圾' },
  { label: 'baolulaji', cname: '暴露垃圾' },
  { label: 'liangshai', cname: '沿街晾晒' },
  { label: 'chengsan', cname: '违规撑伞' },
  { label: 'disuo', cname: '地桩地锁' },
  { label: 'lvhuasunhuai', cname: '绿化损坏' },
  { label: 'daoluposun', cname: '道路破损' },
  { label: 'weijiagai', cname: '垃圾箱未加盖' },
  { label: 'manyi', cname: '垃圾箱满溢' },
  { label: 'qimogongmeng', cname: '气拱门' },
  { label: 'banner', cname: '横幅识别' },
  { label: 'cover', cname: '井盖异常' }
]
/**
 * 垃圾类别
 */
export const TrashType = [
  { label: 'cask_yes', cname: '垃圾桶已盖' },
  { label: 'cask_no', cname: '垃圾桶未盖' },
  { label: 'cask_overflows', cname: '垃圾桶溢满' },
  { label: 'trash', cname: '地面垃圾' }
]

export const ViewTypes = [
  { value: '0', cname: '全部' },
  { value: '1', cname: '人员' },
  { value: '2', cname: '人脸' },
  { value: '3', cname: '机动车' },
  { value: '4', cname: '非机动车' }
]

export const HelmetClothType = [
  { label: 'helmet', cname: '未带安全帽告警' },
  { label: 'reflective', cname: '未穿反光服告警' }
]

export const AiAttribute: any = {
  'gender': '性别',
  'facemask': '是否戴口罩',
  'attachment': '附属物',
  'age': '年龄',
  'direction': '方向',
  'upperwear': '上身服饰',
  'lowerwear': '下身服饰',
  'uppercolor': '上身服饰颜色',
  'lowercolor': '下身服饰颜色'
}

// AI分析频率
export const ResultTimeInterval = {
  '1秒': 1,
  '5秒': 5,
  '10秒': 10,
  '20秒': 20,
  '30秒': 30,
  '1分钟': 60,
  '5分钟': 300,
  '10分钟': 600
}
