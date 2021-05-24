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
  1: '录制中',
  2: '未录制'
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
 * AI告警类型
 * 相应修改src/utils/device.ts
 */
export const AlertType: any = {
  // 1: '未戴口罩',
  6: '未戴口罩',
  8: '人员聚集',
  // 2: '人员聚集',
  // 3: '人员布控',
  4: '人员布控',
  5: '吸烟检测',
  7: '安全帽反光服检测',
  9: '危险区域检测',
  10: '烟雾明火',
  11: '冲压机'
}

export const AiMaskType: any = {
  0: '未戴口罩',
  1: '戴口罩',
  2: '佩戴不规范'
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
  'VSS_VIDEO': '视频包',
  'VSS_UPLOAD_BW': '上行带宽包',
  'VSS_DOWNLOAD_BW': '下行带宽包',
  'VSS_AI': 'AI包'
}
