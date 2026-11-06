// Full data export of the authenticated user (JSON, Item 5.4).
//
// Every row the account owns, in the domain shape the web app uses. Plans are
// empty until the background generation lands (phase 4.7) but are exported
// from now on so the format does not change later.

import {
  bioRecords,
  consents,
  dishes,
  planSelections,
  planShoppingItems,
  plans,
  profileHistory,
  profiles,
  shoppingChecks,
} from '@nutribio/db';
import {desc, eq, inArray} from 'drizzle-orm';
import {requireUser} from '../../utils/auth';
import {apiHandler} from '../../utils/handler';
import {toBioRecord, toProfile} from '../../utils/mappers';

export default apiHandler(async (event) => {
  const user = await requireUser(event);
  const db = useDb();

  const [profileRow] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  const historyRows = await db
    .select()
    .from(profileHistory)
    .where(eq(profileHistory.userId, user.id))
    .orderBy(desc(profileHistory.createdAt));
  const bioRows = await db.select().from(bioRecords).where(eq(bioRecords.userId, user.id));
  const planRows = await db
    .select()
    .from(plans)
    .where(eq(plans.userId, user.id))
    .orderBy(desc(plans.queuedAt));
  const consentRows = await db.select().from(consents).where(eq(consents.userId, user.id));

  const planIds = planRows.map((plan) => plan.id);
  const [dishRows, shoppingItemRows, selectionRows, checkRows] = planIds.length
    ? await Promise.all([
        db.select().from(dishes).where(inArray(dishes.planId, planIds)),
        db.select().from(planShoppingItems).where(inArray(planShoppingItems.planId, planIds)),
        db.select().from(planSelections).where(inArray(planSelections.planId, planIds)),
        db.select().from(shoppingChecks).where(inArray(shoppingChecks.planId, planIds)),
      ])
    : [[], [], [], []];

  const exportedPlans = planRows.map((plan) => ({
    id: plan.id,
    status: plan.status,
    inputsHash: plan.inputsHash,
    locale: plan.locale,
    country: plan.country,
    model: plan.model,
    targets: plan.targets,
    profileSnapshot: plan.profileSnapshot,
    biometricsSnapshot: plan.biometricsSnapshot,
    overview: plan.overview,
    isCurrent: plan.isCurrent,
    queuedAt: plan.queuedAt,
    finishedAt: plan.finishedAt,
    dishes: dishRows
      .filter((dish) => dish.planId === plan.id)
      .map((dish) => ({
        day: dish.day,
        slot: dish.slot,
        variationIndex: dish.variationIndex,
        name: dish.name,
        description: dish.description,
        ingredients: dish.ingredients,
        macros: dish.macros,
        notes: dish.notes,
      })),
    shoppingItems: shoppingItemRows
      .filter((item) => item.planId === plan.id)
      .map((item) => ({
        key: item.key,
        name: item.name,
        category: item.category,
        unitWeightGrams: item.unitWeightGrams,
        packageGrams: item.packageGrams,
        packageLabel: item.packageLabel,
      })),
    selections: selectionRows
      .filter((selection) => selection.planId === plan.id)
      .map((selection) => ({day: selection.day, slot: selection.slot, selectedIndex: selection.selectedIndex})),
    shoppingChecks: checkRows
      .filter((check) => check.planId === plan.id)
      .map((check) => check.key),
  }));

  const exportedAt = new Date();
  setResponseHeader(
    event,
    'content-disposition',
    `attachment; filename="nutribio-export-${exportedAt.toISOString().slice(0, 10)}.json"`,
  );
  setResponseHeader(event, 'cache-control', 'no-store');

  return {
    formatVersion: 1,
    exportedAt: exportedAt.toISOString(),
    account: {id: user.id, email: user.email},
    profile: profileRow ? toProfile(profileRow) : null,
    profileHistory: historyRows.map((row) => ({snapshot: row.snapshot, createdAt: row.createdAt})),
    bioRecords: bioRows.map(toBioRecord),
    plans: exportedPlans,
    consents: consentRows.map((row) => ({
      document: row.document,
      version: row.version,
      locale: row.locale,
      grantedAt: row.grantedAt,
      withdrawnAt: row.withdrawnAt,
    })),
  };
});
