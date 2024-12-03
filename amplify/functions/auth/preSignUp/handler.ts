import { 
  type PreSignUpTriggerHandler,
  type PreSignUpTriggerEvent } from 'aws-lambda'
  import { splitFederateUser } from '../utils' 
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
    const [provider, providerId, sub] = splitFederateUser(event.userName)
    let currentUser = null
    if (provider !== 'email') {
      const listUsersResponse = await cognitClient.listUsers(filterParams).promise()
      // need to checkout user with email exists, if not, create user and link current provider info
      if (!listUsersResponse.Users || listUsersResponse.Users!.length === 0) {
        // create new user
        const createUserParams = {
          UserPoolId: event.userPoolId,
          Username: email,
          DesiredDeliveryMediums: ['EMAIL'],
          ForceAliasCreation: false,
          UserAttributes: [
            {
              Name: 'email',
              Value: email
            },
            {
              Name: 'email_verified',
              Value: 'true'
            }
          ]
        }
        const createUserResponse = await cognitClient.adminCreateUser(createUserParams).promise()
        currentUser = createUserResponse.User
        console.log(`auto create new user: ${email}`)
      } else {
        currentUser = listUsersResponse.Users![0]
      }
      if (!currentUser) throw new Error('User not found')
      // link provider
      const linkProviderParams = {
        DestinationUser: {
          ProviderAttributeValue: currentUser.Username!,
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
      console.log(`link provider: ${provider} ${providerId} ${sub} to ${currentUser.Username}`)
      throw new Error('user from external provider can only offer identity info')
    }

    const identitySource = clientMetadata.identitySource
    if (identitySource === 'email') {
      event.response.autoConfirmUser = false
      event.response.autoVerifyEmail = false
    } 
    // else { //暫時用不上，外部登入者都會被
    //   event.response.autoConfirmUser = true
    //   event.response.autoVerifyEmail = true
    // }
    console.log(`create new user: ${event.userName}`)
  } catch (ex) {
    console.log(`preSignUp error: ${ex}`)
    throw ex
  }
  return event
}
