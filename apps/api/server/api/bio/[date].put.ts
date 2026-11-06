// Create/replace the measurement of a date (dedupe by date, DECISIONS #10).
//
// Replace semantics: the body is the whole measurement, so omitted metrics are
// stored as null (same behaviour as the web `mergeBioRecord`). The unique
// `(user_id, date)` index makes the upsert atomic.

import {bioRecords} from '@nutribio/db';
import {readBody} from 'h3';
import {requireUser} from '../../utils/auth';
import {apiHandler} from '../../utils/handler';
import {loadBiometrics} from '../../utils/queries';
import {bioRecordSchema, parseDateParam, parseInput} from '../../utils/validation';

export default apiHandler(async (event) => {
  const user = await requireUser(event);
  const date = parseDateParam(getRouterParam(event, 'date'));
  const record = parseInput(bioRecordSchema, await readBody(event));

  const columns = {
    weightKg: record.weight ?? null,
    bodyFatPct: record.bodyFat ?? null,
    waterPct: record.water ?? null,
    bmrKcal: record.bmr ?? null,
    visceralFat: record.visceralFat ?? null,
    bmi: record.bmi ?? null,
    muscleKg: record.muscle ?? null,
    proteinPct: record.protein ?? null,
    boneMassKg: record.boneMass ?? null,
    bodyAge: record.bodyAge ?? null,
    idealWeightKg: record.idealWeight ?? null,
  };

  await useDb()
    .insert(bioRecords)
    .values({userId: user.id, date, ...columns})
    .onConflictDoUpdate({target: [bioRecords.userId, bioRecords.date], set: columns});

  return loadBiometrics(user.id);
});
