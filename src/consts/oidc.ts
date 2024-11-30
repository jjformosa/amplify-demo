import { OIDCAuth } from "@src/types/oidc"

export const emptyOIDCAuth: OIDCAuth = {
  idToken: null,
  accessToken: null,
  idTokenPayload: null,
  refreshToken: null,
  expiresIn: null,
  tokenType: null,
  scope: null,
  claims: null
}