import { type VerifyAuthChallengeResponseTriggerHandler } from 'aws-lambda'
import { verifyAccessTokenWithLiff } from '../line'

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  const { identitySource } = event.request.clientMetadata ?? {}
  let verifyResponse
  if (identitySource === 'liff') {
    const access_token = event.request.challengeAnswer
    const [response, errMsg] = await verifyAccessTokenWithLiff(access_token)
    if (errMsg) {
      console.log(`login api fail: ${errMsg}`)
      event.response.answerCorrect = false
      return event
    }
    verifyResponse = response
  }
  if (verifyResponse) {
    event.response.answerCorrect = true
  } else {
    event.response.answerCorrect = false
  }
  return event
}