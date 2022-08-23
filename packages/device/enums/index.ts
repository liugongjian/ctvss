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
export enum InVideoProtocol {
  Gb28181 = 'gb28181',
  Rtmp = 'rtmp',
  Rtsp = 'rtsp',
  Ehome = 'ehome',
  Onvif = 'onvif'
}

/**
 * 视图库接入协议
 */
export enum InViidProtocol {
  Ga1400 = 'ga1400'
}
