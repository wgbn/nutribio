// Profile change history, newest first.

import {profileHistory} from '@nutribio/db';
import {desc, eq} from 'drizzle-orm';
import {requireUser} from '../../utils/auth';
import {apiHandler} from '../../utils/handler';
import {parseHistoryQuery} from '../../utils/validation';

export default apiHandler(async (event) => {
  const user = await requireUser(event);
  const {limit} = parseHistoryQuery(getQuery(event));

  const rows = await useDb()
    .select()
    .from(profileHistory)
    .where(eq(profileHistory.userId, user.id))
    .orderBy(desc(profileHistory.createdAt))
    .limit(limit);

  return {
    items: rows.map((row) => ({snapshot: row.snapshot, createdAt: row.createdAt})),
  };
});
