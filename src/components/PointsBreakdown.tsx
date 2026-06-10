import { useMemo } from 'react';
import { CHAMPION_BONUS, championOf, scoreMatch } from '../lib/scoring.ts';
import type { ChampionBet, Match, Player, Prediction } from '../lib/types.ts';

interface Props {
  players: Player[];
  matches: Match[];
  predictions: Prediction[];
  championBets: ChampionBet[];
}

function isPlayed(m: Match): boolean {
  return m.status === 'finished' && m.home_score !== null && m.away_score !== null;
}

export function PointsBreakdown({ players, matches, predictions, championBets }: Props) {
  const finished = useMemo(
    () =>
      matches
        .filter(isPlayed)
        .sort((a, b) => (a.kickoff_at ?? '').localeCompare(b.kickoff_at ?? '')),
    [matches],
  );
  const champion = championOf(matches);

  const predOf = (playerId: number, matchId: string) =>
    predictions.find((p) => p.player_id === playerId && p.match_id === matchId);

  if (finished.length === 0 && !champion) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-500">
        Пока нет завершённых матчей — начисления появятся после первых результатов.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {champion && (
        <section className="overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-sm">
          <div className="border-b border-amber-200/70 px-4 py-2 text-sm font-bold uppercase text-slate-800">
            Чемпион: {champion}
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {players.map((pl) => {
              const bet = championBets.find((b) => b.player_id === pl.id);
              const ok = bet?.team === champion;
              return (
                <ScoreCell
                  key={pl.id}
                  name={pl.name}
                  guess={bet?.team ?? '—'}
                  points={ok ? CHAMPION_BONUS : 0}
                />
              );
            })}
          </div>
        </section>
      )}

      {finished.map((m) => (
        <section key={m.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-center gap-2 text-sm">
            <span className="font-semibold text-slate-700">{m.home_team}</span>
            <span className="rounded-md bg-slate-900 px-2 py-0.5 font-display font-extrabold tabular-nums text-white">
              {m.home_score}:{m.away_score}
            </span>
            <span className="font-semibold text-slate-700">{m.away_team}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {players.map((pl) => {
              const pred = predOf(pl.id, m.id);
              const pts = pred
                ? scoreMatch(
                    { home: pred.pred_home, away: pred.pred_away },
                    { home: m.home_score as number, away: m.away_score as number },
                  )
                : 0;
              return (
                <ScoreCell
                  key={pl.id}
                  name={pl.name}
                  guess={pred ? `${pred.pred_home}:${pred.pred_away}` : 'нет прогноза'}
                  points={pts}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function ScoreCell({ name, guess, points }: { name: string; guess: string; points: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
          {name}
        </div>
        <div className="tabular-nums text-slate-800">{guess}</div>
      </div>
      <span
        className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
          points > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
        }`}
      >
        +{points}
      </span>
    </div>
  );
}
