export { cn } from "cn"

//convert prisma object into a regular Js object 
type Serialized<T> = T extends Date
    ? string
    : T extends (infer U)[]
      ? Serialized<U>[]
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

export function convertToPlainObject<T>(value: T): Serialized<T> {
    return JSON.parse(JSON.stringify(value));
}

//Format number with decimal places
 export function formatNumberWithDecimal(num:number) : string {
    
    const [int,decimal]=num.toString().toString().split('.');
    return decimal ? `${int}.${decimal.padEnd(2, '0')}` :
    `${int}.00`
 }