import { type PreAuthenticationTriggerHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
import { type SignUpInputWithLiff } from '../line'
import { type PromiseResult } from 'aws-sdk/lib/request'
import { printEachOfStringMap } from '../utils'

const cognitClient = new AWS.CognitoIdentityServiceProvider()

const searchAccountByEmail = (userPoolId:string, email: string): Promise<PromiseResult<AWS.CognitoIdentityServiceProvider.ListUsersResponse, AWS.AWSError>> => {
  const filterParams = {
    UserPoolId: userPoolId,
    AttributesToGet: ['email'],
    Filter: `email = "${email}"`
  }
  return cognitClient.listUsers(filterParams).promise()
}
export const handler: PreAuthenticationTriggerHandler = async (event) => {
  console.log(event.request.validationData) // 不知道為什麼在client填clientData但會出現在validationData
  console.log('clientMetadata')
  if (event.request.clientMetadata) {
    printEachOfStringMap(event.request.clientMetadata, 'clientMetadata')
  }
  console.log('userAttributes')
  printEachOfStringMap(event.request.userAttributes, 'userAttributes')
  console.log(event.triggerSource)
  console.log(event.userName)

  const userPoolId = event.userPoolId
  const userName = event.userName
  // 這時候log出來username可能是${external_provider}_${oidc:sub}
  console.log(`username: ${userName}`)
  const email = event.request.userAttributes.email // 但凡是oidc都有email
  const users = await searchAccountByEmail(userPoolId, email)
  if (users.Users) {
    if (users.Users.length === 1) {
      return event
    } else if (users.Users.length > 1){
      const msg = 'duplicate email exists!!'
      throw new Error(msg)
    }
  }
  const msg = 'signUp needed'
  throw new Error(msg)
}