// DB row types — frontend copy, derived from supabase/schema.sql (DECISIONS.md D2/D6).
// The web/ ↔ src/ boundary forbids cross imports; the pipeline keeps its own copy.

export type Stage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';

export type MatchStatus = 'scheduled' | 'in_play' | 'finished';

export interface Player {
  id: number;
  name: string;
}

export interface Match {
  id: string;
  stage: Stage;
  group_label: string | null;
  home_team: string;
  away_team: string;
  kickoff_at: string | null;
  home_score: number | null;
  away_score: number | null;
  winner: string | null;
  status: MatchStatus;
  updated_at: string;
}

export interface Prediction {
  player_id: number;
  match_id: string;
  pred_home: number;
  pred_away: number;
  updated_at: string;
}

export interface ChampionBet {
  player_id: number;
  team: string;
  updated_at: string;
}
