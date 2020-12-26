export const DeviceStatus = {
  'on': '在线',
  'off': '离线',
  'new': '未注册'
}

export const DeviceType = {
  'ipc': 'IPC',
  'nvr': 'NVR',
  'platform': 'Platform'
}

export const InProtocolType = {
  'gb28181': 'GB28181',
  'rtmp': 'RTMP',
  'onvif': 'ONVIF',
  'rtsp': 'RTSP'
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

export const StreamType = {
  1: '全量视频',
  2: '移动侦测'
}

export const DeviceParams = {
  'deviceType': '类型',
  'deviceStatus': '设备状态',
  'streamStatus': '流状态'
}

export const AlertLevel = {
  normal: '一般警告',
  serious: '严重警告'
}

export const AlertType = {
  1: '未带口罩',
  2: '人员聚集',
  3: '人员上访'
}

export const AlertParams = {
  'alertLevel': '告警级别',
  'alertType': '告警类型'
}
