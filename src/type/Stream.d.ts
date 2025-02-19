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
  createdTime?: string;
  streamName?: string;
  playUrl?: string;
  tags?: Array<any>;
}
