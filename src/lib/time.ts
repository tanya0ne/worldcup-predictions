// Lock deadlines use the players' local timezone (Spain). Editing closes at the
// START of the match day — not at kickoff. Kept in sync with the Supabase
// functions save_prediction / save_champion (which use the same timezone).
export const LOCK_TZ = 'Europe/Madrid';

// YYYY-MM-DD for the given moment, in LOCK_TZ.
function localDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: LOCK_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

// True once it's the match's calendar day (in LOCK_TZ) or later.
export function isMatchDayReached(kickoffIso: string | null): boolean {
  if (!kickoffIso) return false;
  return localDate(new Date(kickoffIso)) <= localDate(new Date());
}

// True once the earliest match's day has arrived (tournament has begun).
export function isTournamentDayReached(kickoffs: (string | null)[]): boolean {
  const valid = kickoffs.filter(Boolean) as string[];
  if (valid.length === 0) return false;
  const earliest = valid.reduce((a, b) => (a < b ? a : b));
  return isMatchDayReached(earliest);
}
