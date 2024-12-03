import { 
  type PreSignUpTriggerHandler,
  type PreSignUpTriggerEvent } from 'aws-lambda'
import AWS from 'aws-sdk'

const cognitClient = new AWS.CognitoIdentityServiceProvider()

export const handler: PreSignUpTriggerHandler = async (event: PreSignUpTriggerEvent) => {
  try {
    const attributes = event.request.userAttributes
    const clientMetadata = event.request.clientMetadata ?? {}
    const email = attributes.email
    const filterParams = {
      UserPoolId: event.userPoolId,
      AttributesToGet: ['email'],
      Filter: `email = "${email}"`
    }
    const listUsersResponse = await cognitClient.listUsers(filterParams).promise()
    if (listUsersResponse.Users && listUsersResponse.Users!.length > 0) {
      // TODO 接受多重登入身份
      // TODO 切換provider?
      let provider = 'liff', provider_id = ''
      if (event.userName.startsWith('Facebook')) provider = 'Facebook', provider_id = ''
      else if (event.userName.startsWith('Google')) provider = 'Google', provider_id = ''
      // TODO 覆寫attributes
      // 如果用戶已存在，則更新其identities屬性
      const existingUser = listUsersResponse.Users[0]
      const existingSub = existingUser.Username ?? email
      
      const updateUserAttributesParams = {
        UserPoolId: event.userPoolId,
        Username: existingSub,
        UserAttributes: [
          {
            Name: 'identities',
            Value: event.request.userAttributes.identities
          }
        ]
      }
      await cognitClient.adminUpdateUserAttributes(updateUserAttributesParams).promise()
      // 自動確認和驗證用戶
      event.response.autoConfirmUser = true
      event.response.autoVerifyEmail = true
      console.log(`find exist user: ${email}, userStatus ${existingUser.UserStatus ?? 'unkown'}`)
    } else {
      const identitySource = clientMetadata.identitySource
      // if (event.triggerSource === 'PreSignUp_AdminCreateUser') {
        switch(clientMetadata.identitySource) {
          case 'liff':
            event.userName = email
            break
          case 'facebook':
            break
          case 'google':
            break
          default:
            break
        }
        if (identitySource === 'email') {
          event.response.autoConfirmUser = false
          event.response.autoVerifyEmail = false
        } else {
          event.response.autoConfirmUser = true
          event.response.autoVerifyEmail = true
        }
        console.log(`create new user: ${event.userName}`)
      // }
    }
  } catch (ex) {
    console.log(`preSignUp error: ${ex}`)
  }
  return event
}
