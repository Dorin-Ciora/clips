export interface RegisterUserPayload {
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  age: number;
}

export interface RegisterUserResponse {
  alertMsg: string;
  alertColor: string;
}
