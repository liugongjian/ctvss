export interface Secret {
    id: number;
    accessKey: string;
    secretKey: string;
    createdTime: string;
    updatedTime: string;
    status: boolean;
    hidden?: boolean;
  }