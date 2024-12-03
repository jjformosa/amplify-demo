import { 
  type PreSignUpTriggerHandler,
  type PreSignUpTriggerEvent } from 'aws-lambda'
import AWS from 'aws-sdk'

const cognitClient = new AWS.CognitoIdentityServiceProvider()

export const handler: PreSignUpTriggerHandler = async (event: PreSignUpTriggerEvent) => {
  try {
    const attributes = event.request.userAttributes
    const clientMetadata = event.request.clientMetadata ?? {}
    console.log('hassub?', attributes.sub)
    const email = attributes.email
    const filterParams = {
      UserPoolId: event.userPoolId,
      AttributesToGet: ['email'],
      Filter: `email = "${email}"`
    }
    let provider = 'email', providerId = '', sub = ''
    if (event.userName.startsWith('Facebook')) {
      // TODO
      provider = 'Facebook'
      providerId = ''
      sub = event.userName.split('_')[1]
    }
    else if (event.userName.startsWith('Google')) {
      // TODO
      provider = 'Google'
      providerId = ''
      sub = event.userName.split('_')[1]
    }
    else if (event.userName.startsWith('amplify-demo-liff')) {
      provider = 'liff'
      providerId = 'amplify-demo-liff'
      sub = event.userName.split('_')[1]
    }
    // TODO 接受多重登入身份
    // TODO 切換provider?
    // TODO 覆寫attributes
    const listUsersResponse = await cognitClient.listUsers(filterParams).promise()
    if (listUsersResponse.Users && listUsersResponse.Users!.length > 0) {
      // 如果用戶已存在，而現在使用者不是信箱註冊，只執行linkProvider而不註冊
      if (provider !== 'email') {
        //linkProvider(current)to exist User
        const current = listUsersResponse.Users![0]
        const linkProviderParams = {
          DestinationUser: {
            ProviderAttributeValue: current.Username ?? email,
            ProviderName: 'Cognito'
          },
          SourceUser: {
            ProviderAttributeName: 'Cognito_Subject',
            ProviderAttributeValue: sub,
            ProviderName: providerId
          },
          UserPoolId: event.userPoolId
        }
        await cognitClient.adminLinkProviderForUser(linkProviderParams).promise()
        throw new Error('User already exists')
      }
    }
    const identitySource = clientMetadata.identitySource
    if (identitySource === 'email') {
      event.response.autoConfirmUser = false
      event.response.autoVerifyEmail = false
    } else {
      event.response.autoConfirmUser = true
      event.response.autoVerifyEmail = true
    }
    console.log(`create new user: ${event.userName}`)
  } catch (ex) {
    console.log(`preSignUp error: ${ex}`)
  }
  return event
}
