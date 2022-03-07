export interface PlayerEvent {
  eventType: string;
  payload: any;
}

export interface DeviceInfo {
  deviceId: string;
  inProtocol: string;
  deviceName: string;
}

export interface StreamInfo {
  /* 主子码流数量 */
  streamSize: number;
  /* 当前码流号 */
  streamNum: number;
  /* 视频宽度 */
  videoWidth: number;
  /* 视频高度 */
  videoHeight: number;
}
