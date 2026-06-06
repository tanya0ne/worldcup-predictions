import { useCallback, useEffect, useState } from 'react';
import { ChampionPicker } from './components/ChampionPicker.tsx';
import { MatchList } from './components/MatchList.tsx';
import { PlayerPicker } from './components/PlayerPicker.tsx';
import { Standings } from './components/Standings.tsx';
import {
  fetchChampionBets,
  fetchMatches,
  fetchPlayers,
  fetchPredictions,
  saveChampionBet,
  savePrediction,
} from './lib/api.ts';
import { useIdentity } from './lib/identity.ts';
import type { ChampionBet, Match, Player, Prediction } from './lib/types.ts';

export default function App() {
  const { playerId, setPlayerId, clear } = useIdentity();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [championBets, setChampionBets] = useState<ChampionBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, m, pr, cb] = await Promise.all([
        fetchPlayers(),
        fetchMatches(),
        fetchPredictions(),
        fetchChampionBets(),
      ]);
      setPlayers(p);
      setMatches(m);
      setPredictions(pr);
      setChampionBets(cb);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSavePrediction = useCallback(
    async (matchId: string, predHome: number, predAway: number) => {
      if (playerId === null) return;
      await savePrediction(playerId, matchId, predHome, predAway);
      setPredictions((prev) => {
        const rest = prev.filter(
          (p) => !(p.player_id === playerId && p.match_id === matchId),
        );
        return [
          ...rest,
          {
            player_id: playerId,
            match_id: matchId,
            pred_home: predHome,
            pred_away: predAway,
            updated_at: new Date().toISOString(),
          },
        ];
      });
    },
    [playerId],
  );

  const handleSaveChampion = useCallback(
    async (team: string) => {
      if (playerId === null) return;
      await saveChampionBet(playerId, team);
      setChampionBets((prev) => {
        const rest = prev.filter((b) => b.player_id !== playerId);
        return [...rest, { player_id: playerId, team, updated_at: new Date().toISOString() }];
      });
    },
    [playerId],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          <span className="text-sm">Загрузка…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="mb-4 text-slate-700">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="cursor-pointer rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const me = players.find((p) => p.id === playerId);
  if (!me) {
    return <PlayerPicker players={players} onPick={setPlayerId} />;
  }
  const opponent = players.find((p) => p.id !== me.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-slate-50">
      <header className="sticky top-0 z-20 border-b border-red-700/30 bg-gradient-to-r from-red-700 to-red-600 text-white shadow-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-amber-300" />
            <h1 className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight">
              Прогнозы ЧМ-2026
            </h1>
          </div>
          <button
            type="button"
            onClick={clear}
            className="cursor-pointer rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-white/25"
          >
            {me.name}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 p-4 pb-20">
        <Standings
          players={players}
          matches={matches}
          predictions={predictions}
          championBets={championBets}
        />
        <ChampionPicker
          me={me}
          opponent={opponent}
          matches={matches}
          championBets={championBets}
          onSave={handleSaveChampion}
        />
        <MatchList
          matches={matches}
          me={me}
          opponent={opponent}
          predictions={predictions}
          onSave={handleSavePrediction}
        />
      </main>
    </div>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
