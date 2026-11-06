// Profile of the authenticated user.

import {profiles} from '@nutribio/db';
import {eq} from 'drizzle-orm';
import {requireUser} from '../../utils/auth';
import {apiError} from '../../utils/errors';
import {apiHandler} from '../../utils/handler';
import {toProfile} from '../../utils/mappers';

export default apiHandler(async (event) => {
  const user = await requireUser(event);
  const [row] = await useDb()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!row) apiError(404, 'profileNotFound');
  return toProfile(row);
});
