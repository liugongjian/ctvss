export interface RecordTemplate {
  templateId?: string;
  templateName: string;
  recordType: number;
  interval: number;
  storageTime: number;
  storeType: Array<string>;
  mp4?: string;
  flv?: string;
  m3u8?: string;
  ts?: string;
  description?: string;
  createdTime?: string;
}

export interface SnapshotTemplate {
  templateId?: string;
  templateName: string;
  region: string;
  rate: number;
  storeType: Array<string>;
  createdTime?: string;
}