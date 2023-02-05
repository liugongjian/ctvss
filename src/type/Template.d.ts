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
  createdTime?: string;
  storageTime: number
}

export interface CallbackTemplate {
  templateId?: string;
  templateName: string;
  recordNotifyUrl: string;
  deviceStatusUrl?: string;
  streamStatusUrl?: string;
  aiEventNotifyUrl?: string;
  callbackKey: string;
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

interface AITemplateAlgorithm {
  aIAbilityId: number;
  aIAbilityName: string;
  aIAbilityAlgorithmId: number;
  algorithmName: string;
  algorithmMetadata: object;
  frameCutFrequency: number;
  threshold?: string | number | null;
}

export interface AITemplate {
  templateId?: string;
  templateName: string;
  description?: string;
  enableType: number;
  threshold?: string | number | null;
  algorithms: AITemplateAlgorithm[];
  createdTime?: string;
  updatedTime?: string;
}

export interface AIAbility {
  aIAbilityId: string;
  name: string;
  summary: string;
  selectedRow?: AIAbilityAlgorithm[];
  algorithms?: AIAbilityAlgorithm[];
  icon?: string;
  labels?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface AIAbilityAlgorithm {
  aIAbilityAlgorithmId: string;
  name: string;
  summary: string;
  needConfig?: boolean;
  algorithmMetadata?: string;
  frameCutFrequency?: number;
  threshold?: string | number | null;
  code: string;
  icon?: string;
  labels?: string;
}
