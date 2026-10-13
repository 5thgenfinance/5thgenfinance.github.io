
export const DEFAULT_RULES = {
  turnLimit: 9, startingClothing: 4, tourniquetsPerPlayer: 2,
  tourniquetsPerTurn: 1, maxClue: 5, extraGuess: true,
  assassinStrikeLimit: 3, rewardThreshold: 3
};
export function rewardFor(correct, threshold = 3) {
  if (correct >= threshold) return 'romantic';
  if (correct >= 2) return 'kiss';
  return null;
}
