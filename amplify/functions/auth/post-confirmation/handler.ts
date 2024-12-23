import type { PostConfirmationTriggerHandler } from 'aws-lambda'
import { printEachOfStringMap, splitFederateUser } from '../utils' 
// import {
//   type AdminLinkProviderForUserCommandInput
// } from '@aws-sdk/client-cognito-identity-provider'
import AWS from 'aws-sdk'

const client = new AWS.CognitoIdentityServiceProvider()

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log('userName', event.userName)
  console.log('triggerSource', event.triggerSource)
  const clientMetadata = event.request.clientMetadata ?? {}
  console.log('clientMetadata')
  if (clientMetadata) printEachOfStringMap(clientMetadata)
  const attributes = event.request.userAttributes
  console.log('attributes')
  printEachOfStringMap(attributes)
  const email = attributes.email
  const filterParams = {
    UserPoolId: event.userPoolId,
    AttributesToGet: ['email'],
    Filter: `email = "${email}"`
  }
  const [ provider ] = splitFederateUser(event.userName)
  if (provider === 'email') {
    // 如果用email註冊，要反過來檢查是否有其他provider需要link
    const listUsersResponse = await client.listUsers(filterParams).promise()
    if (listUsersResponse.Users && listUsersResponse.Users!.length > 0) {
      for (const user of listUsersResponse.Users!) {
        if (user.UserStatus === 'EXTERNAL_PROVIDER' && user.Username !== event.userName) {
          const [ providerName, providerId, sub ] = splitFederateUser(user.Username!)
          const linkProviderParams = {
            DestinationUser: {
              ProviderAttributeValue: event.userName ?? email,
              ProviderName: 'Cognito'
            },
            SourceUser: {
              ProviderAttributeName: 'Cognito_Subject',
              ProviderAttributeValue: sub,
              ProviderName: providerId
            },
            UserPoolId: event.userPoolId
          }
          console.log(`link ${event.userName} to ${providerName}, ${providerId}, ${sub}`)
          await client.adminLinkProviderForUser(linkProviderParams).promise()
        }
      }
    }
  }
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    // TODO add user to group
  }
  return event
};