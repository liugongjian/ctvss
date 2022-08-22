/**
 * ==================
 * 新
 */
import * as enums from '../enums'

/*
  厂商
 */
export const DeviceVendor = {
  '海康': '海康',
  '大华': '大华',
  '宇视': '宇视',
  '其他': '其他'
}

/*
  ehome版本
 */
export const EhomeVersion = {
  '2.0': '2.0'
}

/*
  设备类型
*/
export const DeviceType = {
  [enums.VideoInProtocolType.Gb28181]: {
    'ipc': 'IPC',
    'nvr': 'NVR',
    'platform': 'Platform'
  },
  [enums.VideoInProtocolType.Ehome]: {
    'ipc': 'IPC',
    'nvr': 'NVR'
  },
  [enums.VideoInProtocolType.Rtsp]: {
    'ipc': 'IPC',
    'nvr': 'NVR'
  },
  [enums.VideoInProtocolType.Rtmp]: {
    'ipc': 'IPC'
  }
}

/*
  设备状态
*/
export const DeviceStatus = {
  'on': '在线',
  'off': '离线',
  'new': '未注册'
}

/*
  流状态
*/
export const StreamStatus = {
  'on': '在线',
  'off': '离线',
  'failed': '失败'
}

/*
  录制状态
*/
export const RecordStatus = {
  0: '未录制',
  1: '录制中',
  2: '录制中',
  3: '录制失败'
}

/*
  录制状态对应的图标类型
*/
export const RecordStatusType = {
  0: 'off',
  1: 'on',
  2: 'on',
  3: 'error'
}

/*
  是否启用自动拉流
*/
export const DeviceStreamAutoPull = {
  1: '已启用',
  2: '未启用'
}

/*
  最大码流数
*/
export const MultiStreamSize = {
  1: '单码流',
  2: '双码流',
  3: '三码流'
}

/*
  自动拉取第几码流
*/
export const AutoStreamNum = {
  1: '单码流',
  2: '子码流',
  3: '第三码流'
}

/**
 * 视频接入协议
 */
export const VideoInProtocolType = {
  [enums.VideoInProtocolType.Gb28181]: 'GB28181',
  [enums.VideoInProtocolType.Rtmp]: 'RTMP',
  [enums.VideoInProtocolType.Rtsp]: 'RTSP',
  [enums.VideoInProtocolType.Ehome]: 'EHOME',
  [enums.VideoInProtocolType.Onvif]: 'ONVIF'
}

/**
 * 视频接入协议对应的中台模型字段名
 */
export const VideoInProtocolModelMapping = {
  [enums.VideoInProtocolType.Gb28181]: 'gB28181Device',
  [enums.VideoInProtocolType.Rtmp]: 'rtmpDevice',
  [enums.VideoInProtocolType.Rtsp]: 'rtspDevice',
  [enums.VideoInProtocolType.Ehome]: 'ehomeDevice',
  [enums.VideoInProtocolType.Onvif]: 'onvifDevice'
}

/**
 * 视图接入协议
 */
export const ViidInProtocolType = {
  'ga1400': 'GA1400'
}

/**
 * 视图接入类型
 */
export const ApeType = {
  'APE': '视图采集设备'
}

/**
 * 接入方式
 */
export const DeviceInType = {
  [enums.DeviceType.Ipc]: {
    [enums.DeviceInType.Video]: '视频',
    [enums.DeviceInType.Viid]: '视图',
    [enums.DeviceInType.VideoAndViid]: '视频、视图'
  },
  [enums.DeviceType.Nvr]: {
    [enums.DeviceInType.Video]: '视频',
    [enums.DeviceInType.Viid]: '视图'
  },
  [enums.DeviceType.Platform]: {
    [enums.DeviceInType.Video]: '视频'
  }
}

/**
 * 流传输模式
 */
export const StreamTransType = {
  ps_rtp_udp: 'UDP',
  ps_rtp_tcp: 'TCP',
  h264_rtp_udp: 'UDP',
  h264_rtp_tcp: 'TCP',
  h265_rtp_udp: 'UDP',
  h265_rtp_tcp: 'TCP'
}

/**
 * 行业类型
 */
export const IndustryMap: any =
{
  '08': '城市管理',
  '09': '卫生环保',
  '10': '商检海关',
  '11': '教育部门',
  '40': '农林牧渔业',
  '41': '采矿企业',
  '42': '制造企业',
  '43': '冶金企业',
  '44': '电力企业',
  '45': '燃气企业',
  '46': '建筑企业',
  '47': '物流企业',
  '48': '邮政企业',
  '49': '信息企业',
  '50': '住宿和餐饮业',
  '51': '金融企业',
  '52': '房地产业',
  '53': '商务服务业',
  '54': '水利企业',
  '55': '娱乐企业',
  '80': '居民自建',
  '99': '其他主体'
}

/**
 * 网络标识
 */
export const NetworkMap: any =
{
  '0': '监控报警专网',
  '5': '公安信息网',
  '6': '政务网',
  '7': 'Internet网',
  '8': '社会资源接入网'
}

export default {
  DeviceType,
  DeviceStatus,
  StreamStatus,
  RecordStatus,
  RecordStatusType,
  DeviceStreamAutoPull,
  VideoInProtocolType,
  ViidInProtocolType,
  DeviceInType,
  StreamTransType
}

/**
 * ==================
 * 旧，待整理删除
 */
export const PlatformStatus = {
  'on': '在线',
  'off': '离线'
}

export const DeviceGb28181Type = {
  'ipc': 'IPC',
  'nvr': 'NVR',
  'platform': 'Platform'
}

export const DeviceRtmpType = {
  'ipc': 'IPC',
  'platform': 'Platform'
}

export const DeviceRtspType = {
  'ipc': 'IPC',
  'nvr': 'NVR'
}

export const InType = {
  'push': '推流',
  'pull': '拉流'
}

export const OutProtocolType = {
  'rtmp': 'RTMP',
  'hls': 'HLS',
  'flv': 'FLV',
  'webrtc': 'WebRTC'
}

export const GroupStatus = {
  'on': '已启用',
  'off': '已停用'
}

export const AuthStatus = {
  true: '开启',
  false: '关闭'
}

export const AnonymousType = {
  'anonymous': '匿名',
  'normal': '非匿名'
}

export const RecordStorageType = {
  'MP4': 'mp4',
  'FLV': 'flv',
  'HLS': 'hls'
}

export const SnapshotStorageType: { [key: string]: string } = {
  'cover': '覆盖式截图',
  'realtime': '实时截图'
}

export const SecretStatus = {
  true: '已启用',
  false: '已禁用'
}

export const PullType = {
  1: '已启用',
  2: '已禁用'
}

export const PushType = {
  1: '已启用',
  2: '已禁用'
}

export const CreateSubDevice = {
  1: '是',
  2: '否'
}

export const SipTransType = {
  tcp: 'TCP',
  udp: 'UDP'
}

export const TransPriority = {
  tcp: '是',
  udp: '否'
}

export const RecordStatusFilterType = {
  'off': '未录制',
  'on': '录制中',
  'error': '录制失败'
}

export const StreamType = {
  1: '全量视频',
  2: '移动侦测'
}

export const DeviceParams = {
  'deviceType': '类型',
  'deviceStatus': '设备状态',
  'streamStatus': '流状态',
  'recordStatus': '录制状态'
}

export const AlertLevel = {
  normal: '一般警告',
  serious: '严重警告'
}

export const AlertIcon = {
  normal: 'warning',
  serious: 'alert'
}

/**
 * 视图库
 */
export const ViewLibStatus: any = {
  'on': '在线',
  'off': '离线'
}

/**
 * AI告警类型
 * 相应修改src/utils/device.ts
 */
export const AlertType: any = {
  // 1: '未戴口罩',
  6: '口罩检测', // 10003
  8: '人员聚集', // 10005
  // 2: '人员聚集',
  // 3: '人员布控',
  4: '人脸识别', // 10001
  5: '吸烟检测', // 10002
  7: '安全帽反光服检测', // 10004
  9: '危险区域检测', // 10006
  10: '烟雾明火检测', // 10007
  11: '冲压机检测', // 10008
  12: '人体属性检测', // 10009
  13: '蜜蜂密度检测', // 10010
  14: '铁塔基站设备检测',
  15: '铁塔基站天线检测', // 10012
  16: '医疗防护服检测',
  17: '车牌识别',
  18: '棉花检测',
  19: '入侵检测',
  20: '在场人员+口罩检测',
  21: '垃圾检测',
  23: '电动车检测',
  22: '车辆统计',
  24: '车辆违停检测',
  25: '车辆拥堵检测',
  26: '人群感应检测',
  27: '实时在岗检测',
  32: '人车流量统计',
  28: '人员徘徊检测',
  29: '垃圾站检测',
  30: '视野遮挡检测',
  31: '跌倒检测',
  33: '动物检测'
}

export const AiMaskType: any = {
  0: '未戴口罩',
  1: '戴口罩',
  2: '佩戴不规范'
}

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

export const AlertParams = {
  'alertLevel': '告警级别',
  'alertType': '告警类型'
}

export const ResourceType = {
  'VSS_VIDEO': '视频包',
  'VSS_UPLOAD_BW': '上行带宽包',
  'VSS_DOWNLOAD_BW': '下行带宽包',
  'VSS_AI': 'AI包'
}

export const ResourceAiType = {
  'AI-100': '分钟级',
  'AI-200': '秒级',
  'AI-300': '高算力型'
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

/**
 *  设备事件级别
 */
export const errorLevel = {
  '0': '全部',
  '1': '异常',
  '2': '正常'
}

/**
 *  设备事件类型
 */
export const eventsType = {
  'all': '全部',
  'device': '设备事件',
  'stream': '流事件',
  'record': '录制事件',
  'coderate_overflow': '超码率'
}

/**
 * 视频播放比例
 */
export const scaleKind = [
  { label: '16:9', kind: '16 / 9', num: '3' },
  { label: '4:3', kind: '4 / 3', num: '4' },
  { label: '原始比例', kind: 'normal', num: '2' },
  { label: '拉伸', kind: 'fit', num: '1' }
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

export const AnimalType = [
  { label: 'Bear', cname: '狗熊' }
]
