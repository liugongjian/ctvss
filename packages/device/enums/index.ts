/**
 * 接入方式
 */
export enum DeviceInType {
  Video = 'video',
  Viid = 'viid',
  VideoAndViid = 'videoAndViid'
}

/**
 * 接入方式
 */
export enum DeviceType {
  Ipc = 'ipc',
  Nvr = 'nvr',
  Platform = 'platform'
}

/**
 * 视频接入协议
 */
export enum VideoInProtocolType {
  Gb28181 = 'gb28181',
  Rtmp = 'rtmp',
  Rtsp = 'rtsp',
  Ehome = 'ehome',
  Onvif = 'onvif'
}
