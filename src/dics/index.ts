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
  tcp: 'TCP',
  udp: 'UDP',
  ps_rtp_tcp: 'TCP',
  ps_rtp_udp: 'TCP'
}

export const TransPriority = {
  tcp: '是',
  udp: '否'
}
