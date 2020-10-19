interface RecordTemplateFormat {
  formatType: string,
  interval: number,
  storageTime: number,
  path: string
}
export interface RecordTemplate {
  templateId?: string;
  templateName: string;
  recordType: number;
  formatList: Array<RecordTemplateFormat>,
  description?: string;
  createTime?: string;
}

export interface CallbackTemplate {
  templateId?: string;
  templateName: string;
  recordNotifyUrl: string;
  callbackKey: string;
  description?: string;
  createTime?: string;
}

export interface SnapshotTemplate {
  templateId?: string;
  templateName: string;
  region: string;
  rate: number;
  storeType: Array<string>;
  createdTime?: string;
}