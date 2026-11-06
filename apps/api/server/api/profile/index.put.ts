// Create/replace the profile.
//
// The body carries the whole profile (all fields are required, so
// `excludedFoods`, `observations`, `country`, `supplements` and
// `exercise.workoutTime` are always carried through — DECISIONS #11/#18/#26/
// #32). The previous state is snapshotted into `profile_history` when
// something actually changed ("histórico de alteração de dados").

import {profileHistory, profiles} from '@nutribio/db';
import {eq} from 'drizzle-orm';
import {readBody} from 'h3';
import {requireUser} from '../../utils/auth';
import {apiHandler} from '../../utils/handler';
import {toProfile} from '../../utils/mappers';
import {parseInput, profileUpdateSchema, sameProfile, toProfileColumns} from '../../utils/validation';

export default apiHandler(async (event) => {
  const user = await requireUser(event);
  const {profile, locale} = parseInput(profileUpdateSchema, await readBody(event));
  const columns = toProfileColumns(profile, locale);

  const saved = await useDb().transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .for('update');

    if (existing) {
      const previous = toProfile(existing);
      if (!sameProfile(previous, profile)) {
        await tx.insert(profileHistory).values({userId: user.id, snapshot: previous});
      }
    }

    const [row] = await tx
      .insert(profiles)
      .values({userId: user.id, ...columns})
      .onConflictDoUpdate({target: profiles.userId, set: columns})
      .returning();

    return row;
  });

  return toProfile(saved);
});
