// Account summary for the authenticated user.

import {profiles} from '@nutribio/db';
import {eq} from 'drizzle-orm';
import {requireUser} from '../../utils/auth';
import {apiHandler} from '../../utils/handler';

export default apiHandler(async (event) => {
  const user = await requireUser(event);
  const [row] = await useDb()
    .select({userId: profiles.userId})
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return {id: user.id, email: user.email, hasProfile: Boolean(row)};
});
