/**
 * 接入方式
 */
export enum DeviceInType {
  Video = 'video',
  Viid = 'viid'
}

/**
 * 接入方式
 */
export enum DeviceType {
  Ipc = 'ipc',
  Nvr = 'nvr'
}

/**
 * 视频接入协议
 */
export enum VideoInProtocolType {
  Gb28181 = 'gb28181',
  Rtmp = 'rtmp',
  Onvif = 'onvif',
  Rtsp = 'rtsp',
  Ehome = 'ehome'
}
