// Small helpers shared by the table definitions.

import {sql, type SQL} from 'drizzle-orm';

/** Renders a `('a', 'b', 'c')` list for CHECK constraints. */
export function valueList(values: readonly string[]): SQL {
  const quoted = values.map((value) => `'${value.replace(/'/g, "''")}'`);
  return sql.raw(`(${quoted.join(', ')})`);
}
