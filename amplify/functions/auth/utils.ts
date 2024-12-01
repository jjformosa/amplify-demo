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