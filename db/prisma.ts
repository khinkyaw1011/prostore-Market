
import postgres from '@prisma/orm-postgres/runtime';
import { Temporal } from 'temporal-polyfill';
import type { Contract } from '@/generated/prisma8/contract';
import contractJson from '@/generated/prisma8/contract.json' with { type: 'json' };

// Prisma ORM 8 decodes temporal columns through the global Temporal API, which this
// Node version does not provide. Install the polyfill before the client is created.
if (!('Temporal' in globalThis)) {
  (globalThis as { Temporal?: unknown }).Temporal = Temporal;
}

export const db = postgres<Contract>({
  url: process.env.DATABASE_URL!,
  contractJson,
});
