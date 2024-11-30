export interface OIDCIdToken {
  sub?: string;
  aud?: string;
  email?: string;
  email_verified?: boolean;
  exp?: number;
  iat?: number;
  iss?: string;
  name?: string;
  nonce?: string;
  preferred_username?: string;
  at_hash?: string;
  sid?: string;
  token_use?: string;
  auth_time?: number;
  idp?: string;
  org?: string;
  [key: string]: unknown;
}

export type OIDCAuthToken = string;

export interface OIDCAuth {
  idToken: string | null;
  accessToken: OIDCAuthToken | null;
  idTokenPayload: OIDCIdToken & { picture?: string; } | null;
  refreshToken: OIDCAuthToken | null;
  expiresIn: number | null;
  tokenType: string | null;
  scope: string | null;
  claims: OIDCIdToken | null;
  [key: string]: unknown;
}

export type EMAIL_LOGIN_PARAM = {
  email: string,
  password: string
}

export type LINE_LOGIN_PARAM = {
  accesstoken: string,
  idToken: string
}
