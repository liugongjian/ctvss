export const PlatformStatus = {
  'on': '在线',
  'off': '离线'
}

export const DeviceStatus = {
  'on': '在线',
  'off': '离线',
  'new': '未注册'
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

export const InProtocolType = {
  'gb28181': 'GB28181',
  'rtmp': 'RTMP',
  'onvif': 'ONVIF',
  'rtsp': 'RTSP',
  'ehome': 'EHOME'
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

export const StreamTransType = {
  ps_rtp_udp: 'UDP',
  ps_rtp_tcp: 'TCP',
  h264_rtp_udp: 'UDP',
  h264_rtp_tcp: 'TCP',
  h265_rtp_udp: 'UDP',
  h265_rtp_tcp: 'TCP'
}

export const TransPriority = {
  tcp: '是',
  udp: '否'
}

export const StreamStatus = {
  'on': '在线',
  'off': '离线',
  'failed': '失败'
}

export const RecordStatus = {
  0: '未录制',
  1: '录制中',
  2: '录制中',
  3: '录制失败'
}

export const RecordStatusType: { [key: number]: any } = {
  0: 'off',
  1: 'on',
  2: 'on',
  3: 'error'
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
  33: '动物检测',
  34: '人脸识别v2',
  35: '工作服检测',
  36: '河道垃圾检测'
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

export const Network = {
  'internal': '互联网',
  'private': '专线网络'
}


export const resourceTypes = {
  'VSS_UPLOAD_BW_OD': 'VSS_UPLOAD_BW_OD',
  'VSS_DOWNLOAD_BW_OD': 'VSS_DOWNLOAD_BW_OD',
  'VSS_VIDEO_OD': 'VSS_VIDEO_OD',
  'VSS_STORAGE_OD': 'VSS_STORAGE_OD',
  'VSS_AI_OD': 'VSS_AI_OD',
}

export const billingType = {
  dayPeak: '按带宽日峰值计费',
  traffic: '按流量计费'
}
