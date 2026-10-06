import { z } from 'zod';

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

 //Format error
export function formatError(error: unknown): string {
    if (error instanceof z.ZodError) {
        // Zod v4 dropped `.errors`/`.format()`; issues live on `.issues` and
        // the built-in helpers read from there.
        return error.issues.map((issue) => issue.message).join('. ');
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Something went wrong. Please try again.';
}

//Field errors keyed by form field name, for inline messages
export function fieldErrorsOf(error: unknown): Record<string, string[]> {
    if (error instanceof z.ZodError) {
        return z.flattenError(error).fieldErrors;
    }
    return {};
}