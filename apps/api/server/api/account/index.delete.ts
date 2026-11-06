// Account deletion (data-subject right, Item 5.4).
//
// Deleting the `auth.users` row cascades every `app` row (profiles, history,
// bio records, plans, dishes, selections, checks, consents). Requires an
// explicit `{confirm: true}` body so a mistyped request can never delete an
// account. Stripe customer handling arrives with Item 3.

import {readBody} from 'h3';
import {requireUser} from '../../utils/auth';
import {apiHandler} from '../../utils/handler';
import {deleteAuthUser} from '../../utils/supabaseAdmin';
import {deleteAccountSchema, parseInput} from '../../utils/validation';

export default apiHandler(async (event) => {
  const user = await requireUser(event);
  parseInput(deleteAccountSchema, await readBody(event));

  await deleteAuthUser(user.id);

  setResponseStatus(event, 204);
  return null;
});
