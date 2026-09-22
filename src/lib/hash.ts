// Small deterministic hash used to detect input changes and avoid
// unnecessary Gemini calls (the plan is cached per inputs hash).

/** FNV-1a 32-bit hash of a string, returned as hex. */
export function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Hash of the plan inputs (profile + biometrics snapshot) as a stable string. */
export function planInputsHash(inputs: unknown): string {
  return fnv1a(JSON.stringify(inputs));
}
