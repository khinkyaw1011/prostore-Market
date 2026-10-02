import 'dotenv/config';
import type { Numeric } from '@prisma/orm-postgres/target/codec-types';
import { db } from './prisma';
import sampleData from './sample-data';

// `Numeric<P, S>` is a string branded with the column's precision and scale, so the
// value has to be formatted to the column's scale before it is written.
const price = (value: number): Numeric<12, 2> =>
  value.toFixed(2) as Numeric<12, 2>;
const rating = (value: number): Numeric<3, 2> =>
  value.toFixed(2) as Numeric<3, 2>;

async function main() {
  // Clear existing records in the database. Account and Session go first: both
  // hold a foreign key to User.
  for await (const deleted of db.orm.public.Account.where({}).deleteAll()) {
    console.log(`deleted account ${deleted.provider}/${deleted.providerAccountId}`);
  }
  for await (const deleted of db.orm.public.Session.where({}).deleteAll()) {
    console.log(`deleted session ${deleted.sessionToken}`);
  }
  for await (const deleted of db.orm.public.VerificationToken.where({}).deleteAll()) {
    console.log(`deleted token ${deleted.identifier}/${deleted.token}`);
  }
  for await (const deleted of db.orm.public.User.where({}).deleteAll()) {
    console.log(`deleted user ${deleted.email}`);
  }
  for await (const deleted of db.orm.public.Product.where({}).deleteAll()) {
    console.log(`deleted ${deleted.slug}`);
  }

  // Seed sample users into the user table
  for await (const created of db.orm.public.User.createAll(sampleData.users)) {
    console.log(`seeded user ${created.email}`);
  }

  // Seed sample products into the product table
  for await (const created of db.orm.public.Product.createAll(
    sampleData.products.map((product) => ({
      ...product,
      price: price(product.price),
      rating: rating(product.rating),
    })),
  )) {
    console.log(`seeded ${created.slug}`);
  }

  console.log('Database seeded successfully!');
}

main();
