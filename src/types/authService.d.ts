import { OIDCIdToken, type OIDCAuth } from "./oidc"

export interface AuthService {
  doLogin: ( ...args: any[]) => Promise<unknown>;
  doLogout: () => Promise<void>;
  doRegister: (...args: any[]) => Promise<unknown>;
  getProfile: () => Promise<unknown>;
}

export interface OIDCService extends AuthService {
  auth: OIDCAuth | null;
  isAuth: () => Promise<boolean>;
  // get getAccessToken(): Promise<OIdc | null>;
  readonly accessToken: string | null;
  doGetAccessToken(): Promise<OIDCAuth['accessToken'] | null>;
  getIdToken(): Promise<string | null>;
  getDecodedIdToken(): Promise<OIDCIdToken | null>;
}