// Thin data-access layer over Supabase. Errors bubble up (handled in App).
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

export async function savePrediction(
  playerId: number,
  matchId: string,
  predHome: number,
  predAway: number,
): Promise<void> {
  const { error } = await supabase.from('predictions').upsert(
    {
      player_id: playerId,
      match_id: matchId,
      pred_home: predHome,
      pred_away: predAway,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'player_id,match_id' },
  );
  if (error) throw new Error(error.message);
}

export async function saveChampionBet(playerId: number, team: string): Promise<void> {
  const { error } = await supabase.from('champion_bets').upsert(
    { player_id: playerId, team, updated_at: new Date().toISOString() },
    { onConflict: 'player_id' },
  );
  if (error) throw new Error(error.message);
}
