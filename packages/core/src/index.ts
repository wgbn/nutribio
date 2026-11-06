// @nutribio/core — pure domain logic shared by the web app and the API.
//
// Rules (DECISIONS #35): no runtime dependencies, no DOM/Node globals, no
// hidden state — locale-dependent helpers take the locale explicitly and
// label lookups take an injected `Translate`.

export * from './types';
export * from './translate';
export * from './locales';
export * from './countries';
export * from './format';
export * from './mealTimes';
export * from './calculations';
export * from './plan';
export * from './shopping';
export * from './hash';
export * from './errors';
export * from './prompt';
export * from './schema';
export * from './normalize';
