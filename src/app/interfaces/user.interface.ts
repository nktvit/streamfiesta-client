// interfaces/user.interface.ts
export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}
