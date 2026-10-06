import { db } from '@/db/prisma';
import type { Models } from '@/generated/prisma8/contract';

export type NewUser = {
  name: Models.public_User['name'];
  email: Models.public_User['email'];
  password: Models.public_User['password'];
};

export function createUser(input: NewUser) {
  // `address` is a NOT NULL json column without a database default, so it has to be
  // sent on every insert even though sign-up does not collect it yet.
  return db.orm.public.User.create({ address: {}, ...input });
}