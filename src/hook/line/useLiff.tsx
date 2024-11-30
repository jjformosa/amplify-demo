import React, { useContext, useState, useEffect } from 'react'
import { LiffContext, type OIDCService } from '@src/context/LiffContext'

export type LoginState = {
  inited: boolean,
  isLoggedIn: boolean,
  accessToken: string | null,
  idToken: string | null,
  name: string | null,
  email: string | null,
  picture: string | null
}

export const useLiff = (): OIDCService & LoginState => {
  const [liffState, setLiffState] = useState<LoginState>({
    inited: false,
    isLoggedIn: false,
    accessToken: null,
    idToken: null,
    name: null,
    email: null,
    picture: null
  })
  const context = useContext(LiffContext)
  useEffect(() => {
    const update = async () => {
      const inited = context.inited
      const isLoggedIn = await context.isAuth()
      const accessToken = context.auth?.accessToken ?? null
      const idToken = context.auth?.idToken ?? null
      const decodedIdToken = context.auth?.idTokenPayload
      const auth = context.auth
      console.log('update', auth)
      setLiffState({
        inited,
        isLoggedIn,
        accessToken,
        idToken,
        name: decodedIdToken?.name ?? null,
        email: decodedIdToken?.email ?? null,
        picture: (decodedIdToken?.picture as string) ?? null
      })
    }
    update()
  }, [context.auth])

  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider')
  }
  return { ...context, ...liffState }
}

export const withLiff = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return async (props: P) => {
    <LiffContext.Consumer>
      {liffService => <WrappedComponent {...props} liffService={liffService} />}
    </LiffContext.Consumer>
  }
}
