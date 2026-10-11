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

 // Postgres SQLSTATE for unique_violation. The driver normalizes pg errors into a
// query error carrying sqlState/constraint (see @prisma/orm-family-sql/errors).
const UNIQUE_VIOLATION_SQLSTATE = '23505';

type QueryError = Error & {
    sqlState?: string;
    constraint?: string;
    column?: string;
};

// Constraint names carry a hash suffix in Postgres (user_email_idx_34912d96), so
// match on the prefix declared in prisma8/contract.prisma.
const UNIQUE_MESSAGES: Record<string, string> = {
    user_email_idx: 'An account with this email already exists',
    product_slug_idx: 'A product with this slug already exists',
};

function uniqueViolation(error: unknown): QueryError | null {
    if (!(error instanceof Error)) return null;
    const queryError = error as QueryError;
    return queryError.sqlState === UNIQUE_VIOLATION_SQLSTATE ? queryError : null;
}

//Format error
export function formatError(error: unknown): string {
    if (error instanceof z.ZodError) {
        // Zod v4 dropped `.errors`/`.format()`; issues live on `.issues` and
        // the built-in helpers read from there.
        return error.issues.map((issue) => issue.message).join('. ');
    }
    const violation = uniqueViolation(error);
    if (violation) {
        const prefix = Object.keys(UNIQUE_MESSAGES).find((name) =>
            violation.constraint?.startsWith(name)
        );
        return (prefix && UNIQUE_MESSAGES[prefix]) || 'This value is already taken';
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
    const violation = uniqueViolation(error);
    if (violation) {
        const field = violation.column
            ?? (violation.constraint?.startsWith('user_email_idx') ? 'email' : undefined);
        if (field) return { [field]: [formatError(error)] };
    }
    return {};
}
//Round number to 2 decimal places
export function round2(value:number | string){
    if(typeof value === 'number'){
       return Math.round((value+ Number.EPSILON) * 100)/100;
    }else if(typeof value === 'string'){
         return Math.round((Number(value)+ Number.EPSILON) * 100)/100;
    }
    else {
        throw new Error('Value in not a number or string')
    }
}