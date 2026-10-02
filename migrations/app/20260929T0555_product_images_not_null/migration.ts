#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4185c36a820acf7d46cecff5fd6de014e93c5c036f5999f6a7604193903f91fb/contract';
import endContract from '../../snapshots/4185c36a820acf7d46cecff5fd6de014e93c5c036f5999f6a7604193903f91fb/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f460a55e0824c01c06d1e6ba15a8ee1034cc642cf32ae097cfee1ef6d7cbfa9c/contract';
import startContract from '../../snapshots/f460a55e0824c01c06d1e6ba15a8ee1034cc642cf32ae097cfee1ef6d7cbfa9c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  // The scaffolded `dataTransform` slot is intentionally omitted: `Product.images`
  // holds no NULLs today, and `SET NOT NULL` makes PostgreSQL reject the
  // migration outright if a NULL ever exists, so no pre-cleanup is required.
  override get operations() {
    return [
      this.setNotNull({ schema: 'public', table: 'Product', column: 'images' }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Product',
        constraint: 'Product_images_elem_not_null_2f12556f',
        expression: 'array_position("images", NULL) IS NULL',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
