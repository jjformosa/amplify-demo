import React, { createContext, useState, useEffect, useCallback, useMemo }  from "react"
import { type OIDCService } from "@src/types/authService"
import { type OIDCAuth } from "@src/types/oidc"
import { emptyOIDCAuth } from "@src/consts/oidc"
import { type Liff } from "@line/liff"

type LiffProfile = { name: string, userId: string, picture?: string }

export type { OIDCService, OIDCAuth, Liff, LiffProfile }

export interface LiffService extends OIDCService {
  inited: boolean;
  doLogin: (redirectURL?: string ) => Promise<void>;
  doLogout: () => Promise<void>;
  doRegister: (redirectURL?: string) => Promise<void>;
  getProfile: () => Promise<LiffProfile|null>;
}

export const LiffContext = createContext<LiffService>({
  inited: false,
  auth: emptyOIDCAuth,
  doLogin: async () => {},
  doLogout: async () => {},
  doRegister: async () => {},
  doGetAccessToken: async () => null,
  getIdToken: async () => null,
  getDecodedIdToken: async () => null,
  getProfile: async () => null,
  isAuth: async () => false,
  accessToken: null
})

export type LiffCongigure = {
  children: React.ReactNode,
  liffId?: string
}

export const LiffProvider: React.FC<LiffCongigure> = ({ children, liffId }) => {
  const [liff, setLiff] = useState<Liff|null>(null)
  const [auth, setAuth] = useState<OIDCAuth>(emptyOIDCAuth)
  // func
  const doLogin = useCallback(async (redirectURL?: string|undefined) => {
    if (!liff) return
    liff.login({ redirectUri: redirectURL })
  }, [liff])

  const doLogout = useCallback(async () => {
    if (!liff) return
    liff.logout()
  }, [liff])

  const doRegister = useCallback(async () => {
    throw 'can\'t register by liff'
  }, [liff])

  const doGetAccessToken = useCallback(async () => {
    if (!liff) return null
    let accessToken = auth.accessToken
    if (!accessToken) {
      accessToken = liff.getAccessToken()
      setAuth({
        ...auth,
        accessToken
      })
    }
    return accessToken
  }, [liff])
  
  // getter
  const isAuth = useCallback(async () => {
    if (!liff) return false
    return liff.isLoggedIn()
  }, [liff])
  const getIdToken = useCallback(async () => {
    if (!liff) return null
    let idToken = liff.getIDToken()
    if (!idToken) {
      idToken = liff.getIDToken()
      setAuth({
        ...auth,
        idToken
      })
    }
    return idToken
  }, [liff])
  const getDecodedIdToken = useCallback(async () => {
    if (!liff) return null
    let idTokenPayload = auth.idTokenPayload 
    if (!idTokenPayload) {
      const result = await liff.getDecodedIDToken()
      idTokenPayload = result ? { ...result } : null
      setAuth({
        ...auth,
        idTokenPayload
      })
    }
    return idTokenPayload
  }, [liff])
  const getProfile = useCallback(async () => {
    if (!liff) return null
    const profile = await liff.getProfile()
    return profile ? { name: profile.displayName, userId: profile.userId, picture: profile.pictureUrl } : null
  }, [liff])
  useEffect(() => {
    console.log('useEffect of Liff', liff)
    const update = async () => {
      if (!liff) return
      if (liff.isLoggedIn()) {
        await doGetAccessToken()
        await getIdToken()
        await getDecodedIdToken()
      }
    }
    update()
  }, [liff])

  const initLiff = useCallback(async () => {
    if (liff) return
    const _liff = (await import("@line/liff")).default
    const _liffId = liffId ?? import.meta.env.VITE_LIFF_ID
    console.log(_liffId)
    await _liff.init({ liffId: _liffId })
    setLiff(_liff)
  }, [])

  useEffect (() => {
    initLiff()
  }, [])

  const value = {
    // state
    inited: (liff !== null),
    auth,
    // func
    doLogin,
    doLogout,
    doRegister,
    isAuth,
    // for test
    accessToken: auth.accessToken ?? null,
    decodeIDToken: auth.idTokenPayload ?? null,
    doGetAccessToken,
    getIdToken,
    getDecodedIdToken,
    getProfile
  }

  return (
    <LiffContext.Provider value={ value }>
      { children }
    </LiffContext.Provider>
  )
}