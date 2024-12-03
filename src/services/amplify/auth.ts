import {
  getCurrentUser,
  fetchAuthSession,
  type GetCurrentUserOutput,
  type AuthSession,
  signInWithRedirect,
  signIn, signOut, signUp,
  confirmSignUp, confirmSignIn,
  fetchUserAttributes,
  type SignUpInput, type SignInInput, type ConfirmSignUpInput, type SignInOutput,
  decodeJWT
} from 'aws-amplify/auth'
import { type OIDCIdToken } from '@src/types/oidc'

// TODO 跟liff版本整合，用interface、abstarct、type定義規格

export type { GetCurrentUserOutput, AuthSession }

export type IdentitySource = 'email' | 'liff' | 'lineLogin' | 'google' | 'facebook'

/**
 * 使用者是否已經登入
 * @returns {Promise<boolean>}
 */
export const isLoggedIn = async ():Promise<boolean> => {
  try {
    const awsCognito = (await fetchAuthSession()).tokens
    return awsCognito !== undefined && awsCognito !== null
  } catch (e) {
    const err = e as Error
    console.error(`isLogin fail: ${err.message}`)
  }
  return false
}

export type LoginResult = {
  isSignedIn: boolean,
  errMsg?: string,
  nextStep?: {
    signInStep?: string,
    signUpStep?: string,
    confirmSignInStep?: string
  },
  question?: string[]
}

/**
 * 使用者登入
 * @returns {Promise<void>}
 */
export const doLogin = async ():Promise<void> => {
  if (await isLoggedIn()) {
    // if (isLineClient()) sendTextMessage('您剛剛登入 in-seen網站')
    return
  }
  try {
    return signInWithRedirect({
      provider: { custom: 'liff-test-2' }
    })
  } catch (ex) {
    console.error(`signInWithRedirect fail: ${ex}`)
  }
}

export const doLiginWithEmailPwd = async (email: string, password: string): Promise<LoginResult> => {
  if (await isLoggedIn()) {
    return { isSignedIn: true }
  }
  const signInInput: SignInInput = {
    username: email,
    password,
    options: {
      authFlowType: 'CUSTOM_WITHOUT_SRP',
      userAttributes: {
        email
      },
      clientMetadata: {
        identitySource: 'email'
      }
    }
  }
  try {
    const signInOutput: SignInOutput = await signIn(signInInput)
    if (signInOutput.isSignedIn) {
      return { isSignedIn: true }
    } else {
      if (!signInOutput.nextStep) {
        return { isSignedIn: false }
      }
      console.log(signInOutput.nextStep.signInStep)
      return { isSignedIn: false, nextStep: { signInStep: signInOutput.nextStep.signInStep } }
    }
  } catch (err) {
    const e = err as Error
    console.error('signIn with Email fail:' + err)
    // TODO use enum
    if (e.toString().indexOf('signUp needed') > -1) {
      return { isSignedIn: false, nextStep: { signUpStep: 'SIGN_UP' } }
    }
    return { isSignedIn: false }
    // throw new Error('TODO signIn with email and password')
  }
}

export const doRegisterWithEmailPwd = async (email: string, password: string): Promise<LoginResult> => {
  // TODO return somethin
  const signUpInput: SignUpInput = {
    username: email,
    password,
    options: {
      userAttributes: {
        email
      },
      clientMetadata: {
        identitySource: 'email'
      }
    }
  }
  const signUpOutput = await signUp(signUpInput)
  if (signUpOutput.isSignUpComplete) {
    // should not happend?
    console.log('doRegisterWithEmailPwd success')
    return { isSignedIn: true }
  } else {
    if (!signUpOutput.nextStep) {
      // should not happend?
      console.log('doRegisterWithEmailPwd without nextStep')
      return { isSignedIn: false }
    }
    console.log(signUpOutput.nextStep.signUpStep)
    // throw new Error('TODO signUp with email and password')
    return { isSignedIn: false, nextStep: { signUpStep: signUpOutput.nextStep.signUpStep } }
  }
}

export const doConfirmEmail = async (email: string, verifyCode: string): Promise<boolean> => {
  const confirmSIgnUpInput: ConfirmSignUpInput = {
    username: email,
    confirmationCode: verifyCode
  }
  const confirmSignUpOutput = await confirmSignUp(confirmSIgnUpInput)
  if (confirmSignUpOutput.isSignUpComplete) {
    console.log('doConfirmEmail success')
    return true
  } else {
    console.log(confirmSignUpOutput.nextStep)
    console.log('doConfirmEmail fail')
    return false
  }
}

// const formatChallenge = (question: string, redirectUri: string) => {
//   const link = redirectUri.indexOf('?') > -1 ? `${redirectUri}&answer=${question}` : `${redirectUri}?answer=${question}`
//   return link
// }

export const doLoginWithLiff = async (accesstoken: string, idToken: string):Promise<LoginResult> => {
  if (await isLoggedIn()) {
    // if (liff.isInClient()) liff.sendMessages('您剛剛登入 in-seen網站')
    return { isSignedIn: true }
  }
  try {
    const payload = (decodeJWT(idToken).payload) as OIDCIdToken
    console.log(161, accesstoken, payload)
    // const email = process.env.stage === 'prod' ? (payload.email ?? 'email error') : 'jjformosa1220+2@gmail.com'
    const { email, name, picture } = payload
    if (!email) throw new Error('email is null')
    if (!name) throw new Error('email is name')
    if (!picture) throw new Error('email is picture')
    const username = email
    const clientMetadata = { identitySource : 'liff', email, name } // 這算是重點，寄望這個參數之後可以支援其他socail login的擴充
    const signInInput: SignInInput = {
      username,
      options: {
        authFlowType: 'CUSTOM_WITHOUT_SRP',
        userAttributes: {
          email,
          name,
          picture,
          'custom:liffId': payload.sub,
          'custom:liffAccessToken': accesstoken
        },
        clientMetadata
      }
    }
    const { isSignedIn, nextStep } = await signIn(signInInput)
    console.log(181, isSignedIn)
    console.log(isSignedIn, nextStep.signInStep)
    if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
      if (!payload.email) throw new Error('payload.email is null')
      const confirmSignInOutput = await confirmSignIn({
        challengeResponse: accesstoken,
        options: {
          clientMetadata
        }
      })
      if (confirmSignInOutput.isSignedIn) {
        console.log('aws cognito signin')
      } else {
        console.log(confirmSignInOutput.nextStep)
      }
      return { ...confirmSignInOutput }
      // const question = nextStep.additionalInfo!.question.split(',')
      // const challenge = formatChallenge(nextStep.additionalInfo!.question, redirectUri)
      // sendTextMessage(challenge)
      // return { isSignedIn, nextStep, question}
    } else {
      return { isSignedIn }
    }
  } catch (ex) {
    console.error(`doLoginWithLiff: ${ex}`)
    return { isSignedIn: false, errMsg: ex as string }
  }
}

export const challengeLoginWithLiff = async (accesstoken: string, idToken: string, answer: string):Promise<LoginResult> => {
  try {
    const payload = (decodeJWT(idToken).payload) as OIDCIdToken
    const sub = payload.sub ?? 'sub error'
    const iss = payload.iss ?? 'iss error'
    const aud = payload.aud ?? 'aud error'
    const name = payload.name ?? 'name error'
    const email = payload.email ?? 'email error'
    const picture = payload.picture as string ?? 'picture error'
    const signInInput: SignInInput = {
      username: email,
      // username: payload.email!,
      options: {
        authFlowType: 'CUSTOM_WITHOUT_SRP',
        attributes: {
          'liff:accesstoken': accesstoken,
          'liff:idToken': idToken,
          name,
          email,
          picture
        },
        clientMetadata: {
          identitySource: 'liff',
          accesstoken,
          idToken,
          sub,
          iss,
          aud,
          name,
          email,
          picture
        }
      }
    }
    if (!payload.email) throw new Error('payload.email is null')
    const { isSignedIn, nextStep } = await confirmSignIn({
      challengeResponse: answer,
      options: signInInput.options
    })
    if (isSignedIn) {
      console.log('aws cognito signin')
    } else {
      console.log(nextStep)
    }
    return { isSignedIn, nextStep }
  } catch (ex) {
    console.error(`challengeLoginWithLiff: ${ex}`)
    return { isSignedIn: false }
  }
}

type liffLoginParams = {
  clientId: string,
  accesstoken: string,
  idToken: string,
  payload: OIDCIdToken
}
export const doLogin2 = async (identitySource: IdentitySource, params: liffLoginParams):Promise<void> => {
  if (await isLoggedIn()) return
  try {
    if (identitySource === 'liff') {
      const { accesstoken, idToken, payload } = params
      const JWTPayload = payload as OIDCIdToken
      const sub = JWTPayload.sub ?? 'sub error'
      const iss = JWTPayload.iss ?? 'iss error'
      const aud = JWTPayload.aud ?? 'aud error'
      const name = JWTPayload.name ?? 'name error'
      const email = JWTPayload.email ?? 'email error'
      const picture = JWTPayload.picture as string ?? 'picture error'
      // TODO WITH SRP
      const signInInput: SignInInput = {
        username: params.clientId,
        options: {
          authFlowType: 'CUSTOM_WITHOUT_SRP',
          clientMetadata: {
            accesstoken,
            idToken,
            sub,
            iss,
            aud,
            name,
            email,
            picture
          }
        }
      }
      await signIn(signInInput)
    }
  } catch (ex) {
    console.error(`doLogin2: ${ex}`)
  }
}

export const doLogout = () => signOut()

export const getProfile = async ():Promise<GetCurrentUserOutput> => getCurrentUser()

export const getSession = async ():Promise<AuthSession> => fetchAuthSession()

export const doRegisterByLiff = async (idToken: string, accesstoken: string): Promise<LoginResult> => {
  const payload = (decodeJWT(idToken).payload) as OIDCIdToken
  const { email, picture, name, sub } = payload
  if (!email || !sub) throw new Error('email is null')
  const signUpParam: SignUpInput = {
    // username: registerParam.clientId,
    username: email,
    password: '!1qaz@WSX!', // 這個密碼只是拿來填API, 實際登入時可以拒絕使用信箱跟密碼、要求使用者改密碼、server重產亂數密碼等方法
    options: {
      autoSignIn: true,
      userAttributes: {
        email,
        name,
        picture: picture as string,
        'liffId': sub,
        'liffAccessToken': accesstoken
      }
    }
  }
  const { isSignUpComplete, nextStep } = await signUp(signUpParam)
  return { isSignedIn: isSignUpComplete, nextStep: { signUpStep: nextStep.signUpStep } }
}

export const getUserAttributes = () => fetchUserAttributes()
