import type { PostConfirmationTriggerHandler } from 'aws-lambda'
import { printEachOfStringMap, type StringMap } from '../utils' 
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand
} from '@aws-sdk/client-cognito-identity-provider'

const client = new CognitoIdentityProviderClient()

// add user to group
export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log('userName', event.userName)
  console.log('triggerSource', event.triggerSource)
  const clientMetadata = event.request.clientMetadata ?? {}
  console.log('clientMetadata')
  if (clientMetadata) printEachOfStringMap(clientMetadata)
  const attributes = event.request.userAttributes
  console.log('attributes')
  if (attributes) printEachOfStringMap(attributes)
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    // TODO add user to group
  }
  return event
};