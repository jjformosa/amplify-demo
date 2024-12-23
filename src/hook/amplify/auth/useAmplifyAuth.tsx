import React, { useContext, useState, useEffect, useCallback } from 'react'
import { type OIDCService, type AmplifyAuthService, type IdentitySource, AmplifyAuthContext } from '@src/context/amplify/AuthContext'

type LoginState = {
  inited: boolean,
  isLoggedIn: boolean,
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
    userId: null,
    userName: null,
    name: null,
    email: null,
    picture: null
  })
  const context = useContext(AmplifyAuthContext)

  const update = useCallback(async () => {
    const isLoggedIn = (context.accessToken !== null) && (context.idToken !== null)
    const decodedIdToken = context.idTokenPayload ?? null
    const profile = await context.getProfile()
    setAmplifyState({
      inited: true,
      isLoggedIn,
      userId: profile?.userId ?? null,
      userName: profile?.username ?? null,
      name: decodedIdToken?.name ?? null,
      email: decodedIdToken?.email ?? null,
      picture: (decodedIdToken?.picture as string) ?? null
    })
  }, [context.accessToken, context.idToken])
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
