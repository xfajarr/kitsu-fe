/** Mirrors `kitsu-be/src/services/gamification.ts` for client-side XP bar math. */

const BASE_XP_PER_LEVEL = 100;
const LEVEL_MULTIPLIER = 1.5;

export function calculateLevelFromXp(xp: number) {
  let x = xp;
  if (x < 0) x = 0;

  let level = 1;
  let totalNeeded = BASE_XP_PER_LEVEL;

  while (x >= totalNeeded && level < 100) {
    level++;
    totalNeeded = Math.floor(totalNeeded * LEVEL_MULTIPLIER);
  }

  const prevTotal =
    level > 1 ? Math.floor(BASE_XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 2)) : 0;
  const xpInLevel = x - prevTotal;
  const xpForNext = totalNeeded - x;

  return {
    level,
    xpInLevel,
    xpForNext,
    totalXp: x,
  };
}
