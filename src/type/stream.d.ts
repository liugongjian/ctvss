export interface Stream {
  deviceId: String;
  groupId?: string;
  storeRegion?: string;
  bucketName?: string;
  recordTemplateId?: string;
  callbackTemplateId?: string;
  streamType?: number;
  streamCode?: string;
  expires?: number;
  status?: string;
  createTime?: string;
  streamName?: string;
  playUrl?: string;
}
