// Translator contract for core helpers that need human-readable labels
// (meal names, goal/sex labels, error messages). The web app binds it to
// i18next; the API will bind it to its own catalogs. Core never imports an
// i18n runtime (DECISIONS #35).

export type Translate = (key: string, vars?: Record<string, string | number>) => string;
