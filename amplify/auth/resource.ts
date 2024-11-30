import { defineAuth, referenceAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
// export const auth = defineAuth({
//   loginWith: {
//     email: true
//   }
// });

export const auth = referenceAuth({
  userPoolId: 'us-east-1_2IiNcr9UG',
  userPoolClientId: '2flnjcttd6vdv92ad5lsuf9lu6',
  identityPoolId: 'us-east-1:4198ad33-f56b-4d81-8493-9710a3f23e06',
  authRoleArn: 'arn:aws:iam::540052993261:role/service-role/amplify-demo',
  unauthRoleArn: 'arn:aws:iam::540052993261:role/amplify-d1acfpqguqyy7i-ma-amplifyAuthunauthenticate-TgLaYpVWPHpJ'
})
