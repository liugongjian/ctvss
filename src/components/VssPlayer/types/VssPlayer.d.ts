export interface PlayerEvent {
  eventType: string;
  payload: any;
}

export interface DeviceInfo {
  deviceId: number;
  inProtocol: string;
  deviceName: string;
  roleId?: string;
  realGroupId?: string;
  realGroupInProtocol?: string;
  ptzLockStatus?: number
}
export interface Stream {
  label?: string;
  streamNum: number;
  streamStatus: string;
}

export interface StreamInfo {
  streams: Stream[];
  /* 主子码流数量 */
  streamSize: number;
  /* 当前码流号 */
  streamNum: number;
  /* 视频宽度 */
  videoWidth?: number;
  /* 视频高度 */
  videoHeight?: number;
  /* 编码格式 */
  codec?: string;
  /* 视频流地址 */
  url?: string;
}
