import outputs from '@root/amplify_outputs.json'
import { Amplify } from 'aws-amplify'

/*
 * 初始化AWS Amplify用
 */

// TODO 後續可能調整為分別用amplify-{}的sdk/cdk之類的處理？

/**
 * @type {boolean} 標記Amplify是否已經初始化
 */
let _flagAWSAmplifyInited = false

/**
 * 執行Amplify初始化
 * @returns {Promise<boolean>}
 */
const doInit = function (): Promise<boolean> {
  if (_flagAWSAmplifyInited === true) {
    return Promise.resolve(true)
  }
  try {
    Amplify.configure(outputs)
    // const existingConfig = Amplify.getConfig()
    // Amplify.configure({
    //   ...existingConfig,
    //   API: {
    //     ...existingConfig.API,
    //     REST: outputs.custom.API
    //   }
    // })
    _flagAWSAmplifyInited = true
  } catch (e) {
    const error = e as Error
    console.log(`AWS Amplify init fail: ${error.message}`)
  }
  return _flagAWSAmplifyInited ? Promise.resolve(true) : Promise.reject(new Error('AWS Amplify init fail'))
}

export { doInit }
