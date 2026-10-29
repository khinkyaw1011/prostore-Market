'use server';

import { requireAdmin } from '../auth-guard';
import { getAllUsers } from './user.action';
import { getAllOrders } from './order.action';
import { getAllProducts } from './product.action';

export type SearchScope = 'users' | 'orders' | 'products';

const MAX_SUGGESTIONS = 6;

// Suggestions for the admin search box: names (and emails for users) matching the text
export async function getSearchSuggestions(scope: SearchScope, query: string) {
  await requireAdmin();

  const text = query.trim();
  if (text.length < 1) return [];

  let values: (string | null | undefined)[] = [];

  if (scope === 'users') {
    const { data } = await getAllUsers({ page: 1, limit: MAX_SUGGESTIONS * 2, query: text });
    values = data.flatMap((user) => [user.name, user.email]);
  } else if (scope === 'orders') {
    const { data } = await getAllOrders({ page: 1, limit: MAX_SUGGESTIONS * 2, query: text });
    values = data.map((order) => order.user?.name);
  } else {
    const { data } = await getAllProducts({ page: 1, limit: MAX_SUGGESTIONS * 2, query: text });
    values = data.map((product) => product.name);
  }

  const lower = text.toLowerCase();
  return [...new Set(values.filter((v): v is string => !!v))]
    .filter((v) => v.toLowerCase().includes(lower))
    .slice(0, MAX_SUGGESTIONS);
}
