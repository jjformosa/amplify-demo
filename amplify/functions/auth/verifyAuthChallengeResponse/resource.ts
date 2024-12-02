import { defineFunction, secret } from "@aws-amplify/backend";

const verifyAuthChallengeResponse = defineFunction({
  name: 'verify-auth-challenge-response',
  environment: {
    LINE_IDENTITY_POOL_ID: 'us-east-1:35e7edb4-7bae-4c9e-a3eb-4a094021b954',
    LINE_ID: secret('LINE_ID'),
    LIFF_CLIENT_ID: secret('LIFF_CLIENT_ID'),
    LIFF_CLIENT_SECRET: secret('LIFF_CLIENT_SECRET')
  }
})

export default verifyAuthChallengeResponse