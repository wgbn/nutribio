// Delete the measurement of a date; `latest` falls back to the newest record.

import {bioRecords} from '@nutribio/db';
import {and, eq} from 'drizzle-orm';
import {requireUser} from '../../utils/auth';
import {apiError} from '../../utils/errors';
import {apiHandler} from '../../utils/handler';
import {loadBiometrics} from '../../utils/queries';
import {parseDateParam} from '../../utils/validation';

export default apiHandler(async (event) => {
  const user = await requireUser(event);
  const date = parseDateParam(getRouterParam(event, 'date'));

  const deleted = await useDb()
    .delete(bioRecords)
    .where(and(eq(bioRecords.userId, user.id), eq(bioRecords.date, date)))
    .returning({id: bioRecords.id});

  if (deleted.length === 0) apiError(404, 'bioRecordNotFound');
  return loadBiometrics(user.id);
});
