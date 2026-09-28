export { cn } from "cn"

//convert prisma object into a regular Js object 
export function convertToPlainObject<T>(value:T):T{
    return JSON.parse(JSON.stringify(value));
}