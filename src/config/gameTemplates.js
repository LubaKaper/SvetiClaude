export const GAME_TEMPLATES = {
  percentChange: (game) =>
    `Use a ${game} marketplace example: an item price changes from P_before to P_after. Ask the student to compute the percent increase/decrease and show steps.`,
  ratios: (game) =>
    `Use a ${game} context with resources or items in two groups (A:B). Ask the student to simplify the ratio and solve a proportional question.`,
  linearEq: (game) =>
    `Use a ${game} progression example: total points follow y = m*x + b. Ask the student to identify m and b, then evaluate for a given x.`,
};

export function pickGameForContext(gamePrefs = []) {
  return Array.isArray(gamePrefs) && gamePrefs.length ? gamePrefs[0] : null;
}