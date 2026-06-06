import { useMemo } from 'react';
import { computeStandings } from '../lib/scoring.ts';
import type { ChampionBet, Match, Player, Prediction } from '../lib/types.ts';

interface Props {
  players: Player[];
  matches: Match[];
  predictions: Prediction[];
  championBets: ChampionBet[];
}

export function Standings({ players, matches, predictions, championBets }: Props) {
  const rows = useMemo(
    () => computeStandings(players, matches, predictions, championBets),
    [players, matches, predictions, championBets],
  );

  const nameById = new Map(players.map((p) => [p.id, p.name]));
  const leadTotal = Math.max(0, ...rows.map((r) => r.total));
  const someoneAhead = rows.filter((r) => r.total === leadTotal).length === 1 && leadTotal > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-100 px-4 py-3 text-xl font-bold uppercase text-slate-800">
        Таблица очков
      </h2>
      <table className="w-full">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-4 py-2 text-left font-semibold">Игрок</th>
            <th className="px-1 py-2 text-right font-semibold">Группы</th>
            <th className="px-1 py-2 text-right font-semibold">Плей-офф</th>
            <th className="px-1 py-2 text-right font-semibold">Чемпион</th>
            <th className="px-4 py-2 text-right font-semibold">Итого</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const isLeader = someoneAhead && row.total === leadTotal;
            return (
              <tr key={row.playerId} className={isLeader ? 'bg-amber-50' : ''}>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    {nameById.get(row.playerId) ?? row.playerId}
                    {isLeader && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                        <TrophyIcon className="h-3 w-3" />
                        Лидер
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-1 py-3 text-right tabular-nums text-slate-600">{row.groupPoints}</td>
                <td className="px-1 py-3 text-right tabular-nums text-slate-600">{row.playoffPoints}</td>
                <td className="px-1 py-3 text-right tabular-nums text-slate-600">{row.championPoints}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-display text-2xl font-extrabold tabular-nums ${
                      isLeader ? 'text-red-600' : 'text-slate-800'
                    }`}
                  >
                    {row.total}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18 2H6v2H3v3a4 4 0 0 0 3 3.87A6 6 0 0 0 11 15.9V18H8v2h8v-2h-3v-2.1a6 6 0 0 0 5-4.03A4 4 0 0 0 21 7V4h-3V2ZM5 7V6h1v2.83A2 2 0 0 1 5 7Zm14 0a2 2 0 0 1-1 1.73V6h1v1Z" />
    </svg>
  );
}
