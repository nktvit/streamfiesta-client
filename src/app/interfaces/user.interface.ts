export interface IUser {
  auth0Id: string;
}
export interface IAuthResponse {
  user: IUser;
  token: string;
}
