import 'dotenv/config';
import type { Numeric } from '@prisma/orm-postgres/target/codec-types';
import { db } from './prisma';
import sampleData from './sample-data';

// Unlike seed.ts, this leaves existing users, orders and products untouched and
// only inserts sample products whose slug is not in the database yet.
const price = (value: number): Numeric<12, 2> =>
  value.toFixed(2) as Numeric<12, 2>;
const rating = (value: number): Numeric<3, 2> =>
  value.toFixed(2) as Numeric<3, 2>;

async function main() {
  for (const product of sampleData.products) {
    const existing = await db.orm.public.Product.where({
      slug: product.slug,
    }).first();
    if (existing) {
      console.log(`skipped ${product.slug} (already exists)`);
      continue;
    }

    for await (const created of db.orm.public.Product.createAll([
      {
        ...product,
        price: price(product.price),
        rating: rating(product.rating),
      },
    ])) {
      console.log(`added ${created.slug}`);
    }
  }

  console.log('Products updated successfully!');
  process.exit(0);
}

main();
