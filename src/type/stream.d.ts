export interface Stream {
  deviceId: String;
  groupId?: string;
  storageRegion?: string;
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
