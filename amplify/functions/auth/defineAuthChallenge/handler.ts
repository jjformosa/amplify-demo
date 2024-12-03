import { type DefineAuthChallengeTriggerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
import { printEachOfStringMap } from '../utils'

const cognitClient = new AWS.CognitoIdentityServiceProvider()

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
  event.response.issueTokens = false
  event.response.failAuthentication = false
  const { email, picture, name } = event.request.clientMetadata ?? {}
  console.log('event', email, picture, name)
  console.log('event', event.request.userNotFound)
  const [challengeResponse] = event.request.session
  if (challengeResponse?.challengeName === 'CUSTOM_CHALLENGE') {
    // 代表本次請求來自某一則session的挑戰回應
    const challengeResult = challengeResponse?.challengeResult ?? false
    console.log('challengeResult', challengeResult)
    event.response.issueTokens = challengeResult
    event.response.failAuthentication = !challengeResult
  } else {
    console.log('userAttributes')
    printEachOfStringMap(event.request.userAttributes, 'userAttributes')
    const e = event.request.userAttributes.email
    // 代表本次請求來自某個Amplify Client的首次請求
    const filterParams = {
      UserPoolId: event.userPoolId,
      AttributesToGet: ['email'],
      Filter: `email = "${e}"`
    }
    // 確認email已經存在於userpool
    const listUsersResponse = await cognitClient.listUsers(filterParams).promise()
    const users = listUsersResponse.Users ?? []
    if (users.length === 0) {
      // event.response.issueTokens = false
      // event.response.failAuthentication = true
      const createUserParams = {
        UserPoolId: event.userPoolId,
        Username: e,
        UserAttributes: [
          {
            Name: 'email',
            Value: e
          }
        ]
      }
      if (name) createUserParams.UserAttributes.push({ Name: 'name', Value: name })
      if (picture) createUserParams.UserAttributes.push({ Name: 'picture', Value: picture })
      console.log('createUserParams', createUserParams)
      const createUserResponse = await cognitClient.adminCreateUser(createUserParams).promise()
      console.log('createUserResponse', createUserResponse)
      event.response.challengeName = 'CUSTOM_CHALLENGE'
    } else { //這段會觸發UserPool向前端發起挑戰
      event.response.challengeName = 'CUSTOM_CHALLENGE'
    }
  }
  return event
}