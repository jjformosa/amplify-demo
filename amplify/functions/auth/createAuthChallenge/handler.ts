import { type CreateAuthChallengeTriggerHandler } from 'aws-lambda'
import { printEachOfStringMap } from '../utils'

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  if (event.request.clientMetadata) {
    printEachOfStringMap(event.request.clientMetadata, 'clientMetadata')
  }
  printEachOfStringMap(event.request.userAttributes, 'userAttributes')
  console.log(event.request.userNotFound ?? 'not found')
  console.log(event.triggerSource)
  console.log(event.callerContext)
  console.log('session')
  console.log(event.request.session.length)
  event.request.session.forEach((value) => {
    console.log(value)
  })
  
  if (event.request.challengeName === 'CUSTOM_CHALLENGE') { // 這是從cognito的流程來的，不要誤判其他如PASSWORD_VERIFIER、SMS_MF流程
    event.response.publicChallengeParameters = { question: 'test' }
    event.response.privateChallengeParameters = { answer: 'email' }
    event.response.challengeMetadata = 'LINE_CHALLENGE'; // TODO 支援其他social login
  }
  return event
}