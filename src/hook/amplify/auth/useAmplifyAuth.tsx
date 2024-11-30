import React, { useContext, useState, useEffect } from 'react'
import { type OIDCService, type AmplifyAuthService, type IdentitySource, AmplifyAuthContext } from '@src/context/amplify/AuthContext'

type LoginState = {
  inited: boolean,
  isLoggedIn: boolean,
  accessToken: string | null,
  userName: string | null,
  userId: string | null,
  name: string | null,
  email: string | null,
  picture: string | null
}
export type { LoginState, IdentitySource, OIDCService, AmplifyAuthService }

export const useAmplifyAuth = (): AmplifyAuthService & LoginState => {
  const [amplifyState, setAmplifyState] = useState<LoginState>({
    inited: false,
    isLoggedIn: false,
    accessToken: null,
    userId: null,
    userName: null,
    name: null,
    email: null,
    picture: null
  })
  const context = useContext(AmplifyAuthContext)
  const update = async () => {
    const isLoggedIn = await context.isAuth()
    const accessToken = await context.doGetAccessToken()
    const decodedIdToken = await context.getDecodedIdToken()
    const profile = await context.getProfile()
    setAmplifyState({
      inited: true,
      isLoggedIn,
      accessToken,
      userId: profile?.userId ?? null,
      userName: profile?.username ?? null,
      name: decodedIdToken?.name ?? null,
      email: decodedIdToken?.email ?? null,
      picture: (decodedIdToken?.picture as string) ?? null
    })
  }
  useEffect(() => {
    update()
  }, [context.accessToken])

  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider')
  }
  return { ...context, ...amplifyState }
}

export const withLiff = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return async (props: P) => {
    <AmplifyAuthContext.Consumer>
      {liffService => <WrappedComponent {...props} liffService={liffService} />}
    </AmplifyAuthContext.Consumer>
  }
}
