import React, { useContext, useState, useEffect, useCallback } from 'react'
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

  const updateAuth = useCallback(async () => {
    const isLoggedIn = await context.isAuth()
    const accessToken = context.auth?.accessToken ?? null
    const idToken = context.auth?.idToken ?? null
    const decodedIdToken = context.auth?.idTokenPayload
    setLiffState({
      ...liffState,
      isLoggedIn,
      accessToken,
      idToken,
      name: decodedIdToken?.name ?? null,
      email: decodedIdToken?.email ?? null,
      picture: (decodedIdToken?.picture as string) ?? null
    })
  }, [context.auth])

  useEffect(() => {
    updateAuth() // useEffect 不接受async修飾，所以如果一定要的話，乾脆把function用useCallback額外定義
    // TODO 驗證useCallback跟直接再effect裡面定義const function的效能問題
  }, [context.auth])

  useEffect(() => {
    const inited = context.inited
    console.log('update', inited)
    setLiffState({
      ...liffState,
      inited
    })
  }, [context.inited])

  useEffect(() => {
    if (context.auth?.accessToken) {
      setLiffState({
        ...liffState,
        accessToken: context.auth.accessToken
      })
    }
  }, [context.auth?.accessToken])

  useEffect(() => {
    if (context.auth?.idToken) {
      setLiffState({
        ...liffState,
        idToken: context.auth.idToken
      })
    }
  }, [context.auth?.idToken])

  useEffect(() => {
    if (context.auth?.idTokenPayload) {
      const decodedIdToken = context.auth.idTokenPayload
      setLiffState({
        ...liffState,
        name: decodedIdToken?.name ?? null,
        email: decodedIdToken?.email ?? null,
        picture: (decodedIdToken?.picture as string) ?? null
      })
    }
  }, [context.auth?.idTokenPayload])

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
