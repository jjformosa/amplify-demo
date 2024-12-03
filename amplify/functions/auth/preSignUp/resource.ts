import { defineFunction } from '@aws-amplify/backend'

const preSignUp = defineFunction({
  name: 'pre-signup'
})

export default preSignUp