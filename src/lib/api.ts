// Thin data-access layer over Supabase. Reads are direct; writes go through
// PIN-checked SECURITY DEFINER RPCs (verify_or_claim / save_prediction / save_champion)
// so a player can only change their own bets and only before kickoff.
import { supabase } from './supabase.ts';
import type { ChampionBet, Match, Player, Prediction } from './types.ts';

export async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from('players').select('*').order('id');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await supabase.from('matches').select('*').order('kickoff_at');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchPredictions(): Promise<Prediction[]> {
  const { data, error } = await supabase.from('predictions').select('*');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchChampionBets(): Promise<ChampionBet[]> {
  const { data, error } = await supabase.from('champion_bets').select('*');
  if (error) throw new Error(error.message);
  return data ?? [];
}

function friendly(message: string): string {
  if (message.includes('BAD_PIN')) return 'Неверный PIN-код';
  if (message.includes('LOCKED')) return 'Уже поздно — приём прогнозов закрыт';
  if (message.includes('NO_MATCH')) return 'Матч не найден';
  return message;
}

// Returns true if the PIN is correct (or was just claimed on first use).
export async function verifyOrClaim(playerId: number, pin: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('verify_or_claim', { p_id: playerId, p_pin: pin });
  if (error) throw new Error(error.message);
  return data === true;
}

export async function savePrediction(
  playerId: number,
  pin: string,
  matchId: string,
  predHome: number,
  predAway: number,
): Promise<void> {
  const { error } = await supabase.rpc('save_prediction', {
    p_id: playerId,
    p_pin: pin,
    p_match_id: matchId,
    p_home: predHome,
    p_away: predAway,
  });
  if (error) throw new Error(friendly(error.message));
}

export async function saveChampionBet(playerId: number, pin: string, team: string): Promise<void> {
  const { error } = await supabase.rpc('save_champion', { p_id: playerId, p_pin: pin, p_team: team });
  if (error) throw new Error(friendly(error.message));
}
