export interface Certificate {
  userName: string;
  userType?: string;
  description?: string;
  createdTime?: number;
  updatedTime?: number;
}

export interface GB28181 extends Certificate {
  oldPassword?: string;
  password?: string;
  confirmPassword?: string;
}