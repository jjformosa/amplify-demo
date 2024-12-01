import { defineFunction, secret } from "@aws-amplify/backend";

const createAuthChallenge = defineFunction({
  name: 'create-auth-challenge'
})

export default createAuthChallenge