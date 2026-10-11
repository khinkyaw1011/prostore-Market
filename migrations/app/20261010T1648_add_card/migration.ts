#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/235d6094b554e865995785dea7609abe31d5995125a3676589abe7948de6e91f/contract';
import startContract from '../../snapshots/235d6094b554e865995785dea7609abe31d5995125a3676589abe7948de6e91f/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7ffef93b498c5d54ef5c6cd8117bf9cb889a7070dd6190bbe1929d777340acd5/contract';
import endContract from '../../snapshots/7ffef93b498c5d54ef5c6cd8117bf9cb889a7070dd6190bbe1929d777340acd5/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Cart',
        columns: [
          col('createdAt', 'timestamp(6)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 6 } },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn('gen_random_uuid()'),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('itemPrice', 'numeric(12,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 12, scale: 2 } },
          }),
          col('items', 'json[]', {
            notNull: true,
            default: lit([]),
            codecRef: { codecId: 'pg/json@1', many: true },
          }),
          col('sessionCartId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('shippingPrice', 'numeric(12,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 12, scale: 2 } },
          }),
          col('taxPrice', 'numeric(12,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 12, scale: 2 } },
          }),
          col('totalPrice', 'numeric(12,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 12, scale: 2 } },
          }),
          col('userId', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Cart_items_elem_not_null_ea5c0770',
            'array_position("items", NULL) IS NULL',
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Cart',
        index: 'Cart_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Cart',
        foreignKey: {
          name: 'Cart_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
