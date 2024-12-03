export interface StringMap {
    [name: string]: string;
  }
  
export const printEachOfStringMap = function (inputMap: StringMap, objectName? :string | null): void {
  for (const name in inputMap) {
    const msg = objectName ? `${objectName} has ${name} : ${inputMap[name]}` : 
    `${name} : ${inputMap[name]}`
    console.log(msg)
  }
}

export const splitFederateUser = (userName: string) => {
  let provider = 'email', providerId = '', sub
  if (userName.startsWith('Facebook')) {
    // TODO
    provider = 'Facebook'
    providerId = ''
    sub = userName.split('_')[1]
  }
  else if (userName.startsWith('Google')) {
    // TODO
    provider = 'Google'
    providerId = ''
    sub = userName.split('_')[1]
  }
  else if (userName.startsWith('amplify-demo-liff')) {
    provider = 'liff'
    providerId = 'amplify-demo-liff'
    sub = userName.split('_')[1]
    sub = sub[0].toUpperCase() + sub.substring(1)
  }
  return [provider, providerId, sub]
}