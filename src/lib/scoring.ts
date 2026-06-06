// Pure scoring logic (DECISIONS.md D4). No React / Supabase dependencies.
import type { ChampionBet, Match, Prediction } from './types';

export const POINTS_EXACT = 3;
export const POINTS_DIFF = 2;
export const POINTS_OUTCOME = 1;
export const CHAMPION_BONUS = 25;

export type MatchPoints = 0 | 1 | 2 | 3;

interface Score {
  home: number;
  away: number;
}

function outcome(home: number, away: number): -1 | 0 | 1 {
  if (home > away) return 1;
  if (home < away) return -1;
  return 0;
}

export function scoreMatch(pred: Score, actual: Score): MatchPoints {
  if (pred.home === actual.home && pred.away === actual.away) return POINTS_EXACT;
  if (pred.home - pred.away === actual.home - actual.away) return POINTS_DIFF;
  if (outcome(pred.home, pred.away) === outcome(actual.home, actual.away)) return POINTS_OUTCOME;
  return 0;
}

function isPlayed(match: Match): boolean {
  return match.status === 'finished' && match.home_score !== null && match.away_score !== null;
}

// Champion = explicit winner of the final, else the higher-scoring team of the final.
export function championOf(matches: Match[]): string | null {
  const final = matches.find((m) => m.stage === 'final' && m.status === 'finished');
  if (!final) return null;
  if (final.winner) return final.winner;
  if (final.home_score === null || final.away_score === null) return null;
  // Equal score means the final went to penalties — the pipeline should have set
  // winner above. If it didn't, we return null rather than guess: no champion bonus.
  if (final.home_score === final.away_score) return null;
  return final.home_score > final.away_score ? final.home_team : final.away_team;
}

export interface PlayerStanding {
  playerId: number;
  groupPoints: number;
  playoffPoints: number;
  championPoints: number;
  total: number;
}

export function computeStandings(
  players: { id: number }[],
  matches: Match[],
  predictions: Prediction[],
  championBets: ChampionBet[],
): PlayerStanding[] {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const champion = championOf(matches);

  return players.map((player) => {
    let groupPoints = 0;
    let playoffPoints = 0;

    for (const pred of predictions) {
      if (pred.player_id !== player.id) continue;
      const match = matchById.get(pred.match_id);
      if (!match || !isPlayed(match)) continue;
      const points = scoreMatch(
        { home: pred.pred_home, away: pred.pred_away },
        { home: match.home_score as number, away: match.away_score as number },
      );
      if (match.stage === 'group') groupPoints += points;
      else playoffPoints += points;
    }

    const bet = championBets.find((b) => b.player_id === player.id);
    const championPoints = champion && bet && bet.team === champion ? CHAMPION_BONUS : 0;

    return {
      playerId: player.id,
      groupPoints,
      playoffPoints,
      championPoints,
      total: groupPoints + playoffPoints + championPoints,
    };
  });
}
