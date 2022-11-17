export interface Secret {
  id: number;
  accessKey: string;
  secretKey: string;
  createdTime: string;
  updatedTime: string;
  status: string;
  hidden?: boolean;
  description: string;
}

export interface SecretTip {
  type: string;
  headline: string;
  id: string;
  accessKey: string;
  secretKey: string;
  description: string;
}
