// Liveness/readiness probe. Public on purpose (deploy health checks, phase
// 4.8) and deliberately silent about versions, hosts and configuration.

import {sql} from 'drizzle-orm';
import {apiHandler} from '../utils/handler';

export default apiHandler(async (event) => {
  try {
    await useDb().execute(sql`select 1`);
  } catch {
    setResponseStatus(event, 503);
    return {status: 'degraded', db: 'down'};
  }
  return {status: 'ok', db: 'ok'};
});
