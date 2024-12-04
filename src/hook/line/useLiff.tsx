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

  // useEffect(() => {
  //   const accessToken = context.accessToken ?? null
  //   setLiffState({
  //     ...liffState,
  //     accessToken
  //   })
  // }, [context.accessToken])
  // useEffect(() => {
  //   const idToken = context.idToken ?? null
  //   setLiffState({
  //     ...liffState,
  //     idToken
  //   })
  // }, [context.idToken])
  useEffect(() => {
    const idTokenPayload = context.idTokenPayload ?? null
    const isLoggedIn = idTokenPayload !== null
    setLiffState({
      ...liffState,
      isLoggedIn,
      name: idTokenPayload?.name ?? null,
      email: idTokenPayload?.email ?? null,
      picture: (idTokenPayload?.picture as string) ?? null
    })
  }, [context.idTokenPayload])

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
