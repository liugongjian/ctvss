export interface Secret {
  id: number;
  accessKey: string;
  secretKey: string;
  createdTime: string;
  updatedTime: string;
  status: boolean;
  hidden?: boolean;
}

export interface SecretTip {
  type: string;
  headline: string;
  id: string;
  accessKey: string;
  secretKey: string;
}
