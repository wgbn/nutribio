// Shared read queries.

import type {BiometricsState} from '@nutribio/core';
import {bioRecords} from '@nutribio/db';
import {eq} from 'drizzle-orm';
import {toBiometricsState} from './mappers';

/** Full bioimpedance state of a user (`latest` = newest date). */
export async function loadBiometrics(userId: string): Promise<BiometricsState> {
  const rows = await useDb().select().from(bioRecords).where(eq(bioRecords.userId, userId));
  return toBiometricsState(rows);
}
