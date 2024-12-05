import { OIDCIdToken, type OIDCAuth } from "./oidc"

export interface AuthService {
  doLogin: ( ...args: any[]) => Promise<unknown>;
  doLogout: () => Promise<void>;
  doRegister: (...args: any[]) => Promise<unknown>;
  getProfile: () => Promise<unknown>;
}

export interface OIDCService extends AuthService {
  readonly accessToken: string | null;
  readonly idToken: string | null;
  readonly idTokenPayload: OIDCIdToken | null;
  getAccessToken(): Promise<OIDCAuth['accessToken'] | null>;
  getIdToken(): Promise<string | null>;
  getDecodedIdToken(): Promise<OIDCIdToken | null>;
}