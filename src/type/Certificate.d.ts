export interface Certificate {
  userName: string;
  userType?: string;
  description?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface GB28181 extends Certificate {
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface EHOME extends Certificate {
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface GA1400 extends Certificate {
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}
