export interface RecordTemplate {
  templateId?: string;
  templateName: string;
  region: string;
  interval: number;
  storeType: Array<string>;
  storeRules?: Array<string>;
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