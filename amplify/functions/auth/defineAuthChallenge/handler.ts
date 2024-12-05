import { type DefineAuthChallengeTriggerHandler } from 'aws-lambda'

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
  event.response.issueTokens = false
  event.response.failAuthentication = false
  const { email, picture, name } = event.request.clientMetadata ?? {}
  console.log('event', email, picture, name)
  console.log('event', event.request.userNotFound)
  const [challengeResponse] = event.request.session
  if (challengeResponse?.challengeName === 'CUSTOM_CHALLENGE') {
    // 代表本次請求來自某一則session的挑戰回應
    const challengeResult = challengeResponse?.challengeResult ?? false
    console.log('challengeResult', challengeResult)
    event.response.issueTokens = challengeResult
    event.response.failAuthentication = !challengeResult
  } else {
    //這段會觸發UserPool向前端發起挑戰
    event.response.challengeName = 'CUSTOM_CHALLENGE'
  }
  return event
}