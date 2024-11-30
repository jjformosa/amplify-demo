/* 定義urlschema相關的檢查器 */

/* 檢查是否符合http網址url */
const _regexDomainUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
const _regexLocalHostOrIPPortUrl = /^(https?:\/\/)(localhost|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(:\d{1,5})?$/

/**
 * 檢查輸入的字串是否符合網址格式
 * @param {string} inputString 要檢查的字串
 * @returns {boolean} 輸入的字串是否符合網址格式
 */
const validateDomainUrl = (inputString: string): boolean => _regexDomainUrl.test(inputString)

/**
 * 檢查輸入的字串是否符合ip:port或者localhost格式
 * @param {string} inputString 要檢查的字串
 * @returns {boolean} 輸入的字串是否符合ip:port或者localhost格式
 */
const validateLocalHostOrIpPort = (inputString: string): boolean => _regexLocalHostOrIPPortUrl.test(inputString)

/**
 * 檢查輸入的字串是否符合網址格式
 * @param {string} inputString 要檢查的字串
 * @returns {[boolean, string|null]} return第一個值是輸入的字串是否符合網址格式，第二個值是符合哪種格式
 */
const validateWebsiteUrl = (inputString: string): [boolean, string|null] => validateDomainUrl(inputString) ? [true, 'domainUrl'] : validateLocalHostOrIpPort(inputString) ? [true, 'localhostOrIPPort'] : [false, null]

export default validateWebsiteUrl
export { validateDomainUrl, validateLocalHostOrIpPort }
