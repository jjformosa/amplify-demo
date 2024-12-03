import { defineAuth } from '@aws-amplify/backend';
import { secret } from '@aws-amplify/backend';
import preAuthentication from '../functions/auth/preAuthentication/resource';
import defineAuthChallenge from '../functions/auth/defineAuthChallenge/resource';
import createAuthChallenge from '../functions/auth/createAuthChallenge/resource';
import verifyAuthChallengeResponse from '../functions/auth/verifyAuthChallengeResponse/resource';
import preSignUp from '../functions/auth/preSignUp/resource';
import postConfirmation from '../functions/auth/post-confirmation/resource'

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      oidc: [{
        name: 'amplify-demo-liff',
        clientId: secret('LIFF_CLIENT_ID'),
        clientSecret: secret('LIFF_CLIENT_SECRET'),
        issuerUrl:'https://access.line.me',
        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
            email: 'email',
            custom: {
              liffId: 'liffId',
              liffToken: 'liffAccessToken'
            }
          }
      }],
      callbackUrls: ['https://localhost:5173'],
      logoutUrls:['https://localhost:5173']
    }
  }, 
  triggers: {
    preAuthentication,
    defineAuthChallenge,
    createAuthChallenge,
    verifyAuthChallengeResponse,
    preSignUp,
    postConfirmation
  }
});

// if use exist Auth
// export const auth = referenceAuth({
//   userPoolId: 'us-east-1_2IiNcr9UG',
//   userPoolClientId: '2flnjcttd6vdv92ad5lsuf9lu6',
//   identityPoolId: 'us-east-1:4198ad33-f56b-4d81-8493-9710a3f23e06',
//   authRoleArn: 'arn:aws:iam::540052993261:role/service-role/amplify-demo',
//   unauthRoleArn: 'arn:aws:iam::540052993261:role/amplify-d1acfpqguqyy7i-ma-amplifyAuthunauthenticate-TgLaYpVWPHpJ'
// })
