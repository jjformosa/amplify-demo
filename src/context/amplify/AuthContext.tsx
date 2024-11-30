import React, { createContext, useState, useEffect, useCallback }  from "react"
import { type OIDCService } from "@src/types/authService"
import { doInit as InitAmplify } from "@src/services/amplify"
import * as AwsAuth from "@src/services/amplify/auth"
import type { OIDCAuth, EMAIL_LOGIN_PARAM, LINE_LOGIN_PARAM } from "@src/types/oidc"
import { emptyOIDCAuth } from "@src/consts/oidc"
import { type IdentitySource } from '@src/services/amplify/auth'

type AmplifyAuthCongigure = {
  children: React.ReactNode
}

interface AmplifyAuthService extends OIDCService { 
  isBusy: boolean,
  doLogin: (identitySource: IdentitySource, args: EMAIL_LOGIN_PARAM | LINE_LOGIN_PARAM) => Promise<void>;
  doLogout: () => Promise<void>;
  doRegister: (identitySource: IdentitySource, args: unknown) => Promise<void>;
  getProfile: () => Promise<{ username: string, userId: string }|null>;
}

export type { IdentitySource, AmplifyAuthService, OIDCService, AmplifyAuthCongigure }

export const AmplifyAuthContext = createContext<AmplifyAuthService>({
  isBusy: false,
  auth: null,
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

export const AmplifyAuthProvider: React.FC<AmplifyAuthCongigure> = ({ children }) => {
  // general AuthService that extend OIDCService
  const [inited, setInited] = useState(false)
  const [auth, setAuth] = useState<OIDCAuth>(emptyOIDCAuth)
  const [isBusy, setBusy] = useState(false)

  const _refreshToken = useCallback(async () => {
    if (!inited) return
    if (isBusy) return
    setBusy(true)
    try {
      const tokens = (await AwsAuth.getSession()).tokens ?? null
      if (tokens) {
        const { accessToken, idToken } = tokens
        setAuth({
          ...auth,
          accessToken: accessToken.toString(),
          idToken: idToken?.toString() ?? null,
          idTokenPayload: null
        })
      }
    } catch (e) {
      console.error(e)
    }
    setBusy(false)
  }, [inited])

  const isAuth = useCallback(async () => {
    if (!inited) return false
    return (await doGetAccessToken()) !== null
  }, [inited])

  const doLogin = useCallback(async (identitySource: string, args: EMAIL_LOGIN_PARAM | LINE_LOGIN_PARAM) => {
    if (!inited) return
    if (await isAuth()) return
    setBusy(true)
    if (identitySource === 'email') {
      const { email, password } = args as EMAIL_LOGIN_PARAM
      await AwsAuth.doLiginWithEmailPwd(email, password)
    } else if (identitySource === 'liff') {
      const { accesstoken, idToken } = args as LINE_LOGIN_PARAM
      await AwsAuth.doLoginWithLiff(accesstoken, idToken)
    }
    await AwsAuth.doLogin()
    setBusy(false)
  }, [inited])

  const doLogout = useCallback(async () => {
    if (!inited) return
    if (!(await isAuth())) return
    await AwsAuth.doLogout()
    setAuth(emptyOIDCAuth)
  }, [inited])

  const _registerWithEamil = async (email: string, password: string) => {
    const registerResult = await AwsAuth.doRegisterWithEmailPwd(email, password)
    console.log('registerResult', registerResult)
    if (registerResult.isSignedIn) {
      await _refreshToken()
    } else {
      throw new Error('register failed')
    }
  }

  const doRegister = useCallback(async (identitySource: IdentitySource, args: unknown) => {
    if (!inited) return
    if (await isAuth()) return
    switch(identitySource) {
      case 'email':
        const { email, password } = args as { email: string, password: string }
        await _registerWithEamil(email, password)
        break;
      default:
        throw new Error(`not supported identitySource: ${identitySource}`)
    }
  }, [inited])

  const doGetAccessToken = useCallback(async () => {
    if (!auth?.accessToken) {
      await _refreshToken()
    }
    return auth?.accessToken ?? null
  }, [inited])

  const getIdToken = useCallback(async () => {
    if (!auth?.idToken) {
      await _refreshToken()
    }
    return auth?.idToken ?? null
  }, [inited])

  const getDecodedIdToken = useCallback(async () => {
    if (!auth?.idTokenPayload) {
      await _refreshToken()
    }
    return auth?.idTokenPayload ?? null
  }, [inited])

  const getProfile = useCallback(async () => {
    if (!inited) return null
    const profile =  await AwsAuth.getProfile()
    return profile ? { username: profile.username, userId: profile.userId } : null
  }, [inited])

  useEffect(() => {
    if (inited) {
      _refreshToken()
    }
  }, [inited])
  

  useEffect(() => {
    InitAmplify().then(() => {
      setInited(true)
    }).catch((err) => {
      console.error(err)
    })
  }, [])

  const value = {
    isBusy,
    auth,
    // func
    doLogin,
    doLogout,
    doRegister,
    isAuth,
    // for test
    accessToken: auth?.accessToken ?? null,
    decodeIDToken: auth?.idTokenPayload ?? null,
    doGetAccessToken,
    getIdToken,
    getDecodedIdToken,
    getProfile
  }

  return (
    <AmplifyAuthContext.Provider value={ value }>
      {children}
    </AmplifyAuthContext.Provider>
  )
}