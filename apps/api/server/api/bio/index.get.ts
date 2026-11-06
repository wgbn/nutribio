// Bioimpedance history of the authenticated user (`BiometricsState` shape:
// history ascending by date, `latest` = newest record).

import {requireUser} from '../../utils/auth';
import {apiHandler} from '../../utils/handler';
import {loadBiometrics} from '../../utils/queries';

export default apiHandler(async (event) => {
  const user = await requireUser(event);
  return loadBiometrics(user.id);
});
