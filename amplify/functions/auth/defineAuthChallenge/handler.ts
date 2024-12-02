import { type DefineAuthChallengeTriggerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'

const cognitClient = new AWS.CognitoIdentityServiceProvider()

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
  event.response.issueTokens = false
  event.response.failAuthentication = false
  const [challengeResponse] = event.request.session
  if (challengeResponse?.challengeName === 'CUSTOM_CHALLENGE') {
    // 代表本次請求來自某一則session的挑戰回應
    const challengeResult = challengeResponse?.challengeResult ?? false
    console.log('challengeResult', challengeResult)
    event.response.issueTokens = challengeResult
    event.response.failAuthentication = !challengeResult
  } else {
    const email = event.request.userAttributes.email
    // 代表本次請求來自某個Amplify Client的首次請求
    const filterParams = {
      UserPoolId: event.userPoolId,
      AttributesToGet: ['email'],
      Filter: `email = "${email}"`
    }
    // 確認email已經存在於userpool
    const listUsersResponse = await cognitClient.listUsers(filterParams).promise()
    const users = listUsersResponse.Users ?? []
    if (users.length === 0) {
      // event.response.issueTokens = false
      // event.response.failAuthentication = true
      const createUserParams = {
        UserPoolId: event.userPoolId,
        Username: email,
        UserAttributes: [
          {
            Name: 'email',
            Value: email
          }
        ]
      }
      const name = event.request.userAttributes.name
      const picture = event.request.userAttributes.picture
      if (name) createUserParams.UserAttributes.push({ Name: 'name', Value: name })
      if (picture) createUserParams.UserAttributes.push({ Name: 'picture', Value: picture })
      const createUserResponse = await cognitClient.adminCreateUser(createUserParams).promise()
      console.log('createUserResponse', createUserResponse)
      event.response.challengeName = 'CUSTOM_CHALLENGE'
    } else { //這段會觸發UserPool向前端發起挑戰
      event.response.challengeName = 'CUSTOM_CHALLENGE'
    }
  }
  return event
}