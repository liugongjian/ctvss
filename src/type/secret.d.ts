export interface Secret {
    id: number;
    accessKey: string;
    secretKey: string;
    createTime: string;
    updateTime: string;
    status: boolean;
    hidden?: boolean;
  }