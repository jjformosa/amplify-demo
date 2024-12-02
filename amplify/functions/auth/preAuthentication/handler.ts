import { type PreAuthenticationTriggerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
import { type SignUpInputWithLiff, type IdentitySource } from '../line'
import { type PromiseResult } from 'aws-sdk/lib/request'

const cognitClient = new AWS.CognitoIdentityServiceProvider()

const signUpWithLine = async (signUpInputWithLiff: SignUpInputWithLiff): Promise<AWS.CognitoIdentityServiceProvider.SignUpResponse> => {
  const signUpInput: AWS.CognitoIdentityServiceProvider.SignUpRequest = {
    ClientId: signUpInputWithLiff.clientId,
    Username: signUpInputWithLiff.clientId,
    Password: '1qaz@wsx!', // TODO MFA
    UserAttributes: [
      { Name: 'email', Value: signUpInputWithLiff.email },
      { Name: 'name', Value: signUpInputWithLiff.name },
      { Name: 'picture', Value: signUpInputWithLiff.picture },
      { Name: 'custom:line_access_token', Value: signUpInputWithLiff.accesstoken }
    ]
  }
  const signUpResult = await cognitClient.signUp(signUpInput).promise()
  console.log('signUpResult')
  console.log(signUpResult)
  return signUpResult
}

const searchAccountByEmail = (userPoolId:string, email: string): Promise<PromiseResult<AWS.CognitoIdentityServiceProvider.ListUsersResponse, AWS.AWSError>> => {
  const filterParams = {
    UserPoolId: userPoolId,
    AttributesToGet: ['email'],
    Filter: `email = "${email}"`
  }
  return cognitClient.listUsers(filterParams).promise()
}

const signInWithLiff = async () => {
  // TODO
  // const userPoolId = event.userPoolId
  // const userName = event.userName
  // const userAttributes = event.request.userAttributes
  // const email = userAttributes.email
  // const listUsersResponse = await searchAccountByEmail(userPoolId, email)
  // if (listUsersResponse.Users && listUsersResponse.Users!.length > 0) {
  //   let provider = 'line', provider_id = ''
  //   if (userName.startsWith('Facebook')) provider = 'Facebook', provider_id = ''
  //   else if (userName.startsWith('Google')) provider = 'Google', provider_id = ''
    
  //   // 更新資料
  //   const existingUser = listUsersResponse.Users[0]
  //   const existingSub = existingUser.Username ?? email
  //   const liff_accesstoken = userAttributes['liff:accesstoken']
    
  //   const updateUserAttributesParams = {
  //     UserPoolId: event.userPoolId,
  //     Username: existingSub,
  //     UserAttributes: [
  //       { Name: 'picture', Value: event.request.userAttributes.picture },
  //       { Name: 'name', Value: event.request.userAttributes.name },
  //       { Name: 'custom:liff_accesstoken', liff_accesstoken }
  //     ]
  //   }
  //   await cognitClient.adminUpdateUserAttributes(updateUserAttributesParams).promise()

  //   console.log(`find exist user: ${email}`)
  // } else {
  //   // 檢查資料並註冊
  //   const clientMetadata = event.request.validationData!
  //   const identitySource = clientMetadata['identitySource'] as IdentitySource
  //   let signUpResponse: AWS.CognitoIdentityServiceProvider.SignUpResponse | null = null
  //   switch(identitySource) {
  //     case 'liff':
  //       // TODO verify with sub, aud, iss, accesstoken or idToken
  //       const signUpWithLiff: SignUpInputWithLiff = {
  //         clientId: clientMetadata['sub'],
  //         email: clientMetadata['email'],
  //         name: clientMetadata['name'],
  //         picture: clientMetadata['picture'],
  //         accesstoken: clientMetadata['accesstoken']
  //       }
  //       signUpResponse = await signUpWithLine(signUpWithLiff)
  //       break
  //   }
  //   if (signUpResponse) {
  //     console.log(signUpResponse.CodeDeliveryDetails)
  //     console.log(signUpResponse.UserConfirmed)
  //     console.log(signUpResponse.UserSub)
  //     console.log(`register user: ${email}, ${signUpResponse.UserSub}`)
  //   } else {
  //     // TODO handle error
  //   }
  // }
  // return event
}

const signInWithEmailAndPWD = async (userPoolId: string, email: string) => {
  const listUsersResponse = await searchAccountByEmail(userPoolId, email)
  if (listUsersResponse.Users && listUsersResponse.Users!.length > 0) {

  }
}

export const handler: PreAuthenticationTriggerHandler = async (event) => {
  console.log(event.request.validationData) // 不知道為什麼在client填clientData但會出現在validationData
  console.log(event.request.clientMetadata)
  console.log(event.request.userAttributes)
  console.log(event.triggerSource)
  console.log(event.userName)

  const userPoolId = event.userPoolId
  const userName = event.userName
  // 這時候log出來username不見得是client填的email...
  // console.log(`username: ${userName}`)
  const email = event.request.userAttributes.email
  const users = await searchAccountByEmail(userPoolId, email)
  if (users.Users) {
    if (users.Users.length === 1) {
      return event
    } else if (users.Users.length > 1){
      const msg = 'duplicate email exists!!'
      console.log(msg)
      throw new Error(msg)
    }
  }
  const msg = 'signUp needed'
  throw new Error(msg)
}