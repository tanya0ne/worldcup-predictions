import { useMemo, useState } from 'react';
import { STAGE_LABELS, STAGE_SHORT, stageRank } from '../lib/stages.ts';
import type { Match, Player, Prediction, Stage } from '../lib/types.ts';
import { MatchCard } from './MatchCard.tsx';

interface Props {
  matches: Match[];
  me: Player;
  opponent: Player | undefined;
  predictions: Prediction[];
  onSave: (matchId: string, predHome: number, predAway: number) => Promise<void>;
}

interface Group {
  key: string;
  title: string; // full title shown above the matches
  short: string; // short label shown in the tab strip
  matches: Match[];
}

// Group stage is split by group_label (A..L); playoff stages are single groups.
function groupMatches(matches: Match[]): Group[] {
  const sorted = [...matches].sort((a, b) => {
    const byStage = stageRank(a.stage) - stageRank(b.stage);
    if (byStage !== 0) return byStage;
    const byGroup = (a.group_label ?? '').localeCompare(b.group_label ?? '');
    if (byGroup !== 0) return byGroup;
    return (a.kickoff_at ?? '').localeCompare(b.kickoff_at ?? '');
  });

  const groups: Group[] = [];
  const indexByKey = new Map<string, number>();

  for (const match of sorted) {
    const stage = match.stage as Stage;
    const isGroup = stage === 'group';
    const key = isGroup ? `group-${match.group_label ?? '?'}` : stage;
    const title = isGroup ? `Группа ${match.group_label ?? '?'}` : STAGE_LABELS[stage];
    const short = isGroup ? (match.group_label ?? '?') : STAGE_SHORT[stage];

    let idx = indexByKey.get(key);
    if (idx === undefined) {
      idx = groups.length;
      indexByKey.set(key, idx);
      groups.push({ key, title, short, matches: [] });
    }
    groups[idx].matches.push(match);
  }
  return groups;
}

export function MatchList({ matches, me, opponent, predictions, onSave }: Props) {
  const groups = useMemo(() => groupMatches(matches), [matches]);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const predByKey = useMemo(() => {
    const map = new Map<string, Prediction>();
    for (const p of predictions) map.set(`${p.player_id}:${p.match_id}`, p);
    return map;
  }, [predictions]);

  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-500">
        Матчи ещё не загружены. Они появятся после первой загрузки расписания.
      </div>
    );
  }

  const active = groups.find((g) => g.key === activeKey) ?? groups[0];

  return (
    <section>
      {/* Stage tab strip — horizontally scrollable, sticky under the header */}
      <div className="sticky top-14 z-10 -mx-4 mb-3 bg-gradient-to-b from-red-50 to-slate-50/95 px-4 py-2 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Стадии турнира">
          {groups.map((g) => {
            const isActive = g.key === active.key;
            return (
              <button
                key={g.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveKey(g.key)}
                className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white shadow'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                }`}
              >
                {g.short}
              </button>
            );
          })}
        </div>
      </div>

      <h2 className="mb-2.5 flex items-center gap-2 px-1">
        <span className="h-5 w-1.5 rounded-full bg-red-600" />
        <span className="text-xl font-bold uppercase tracking-tight text-slate-800">
          {active.title}
        </span>
      </h2>

      <div className="space-y-3">
        {active.matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            me={me}
            opponent={opponent}
            myPrediction={predByKey.get(`${me.id}:${match.id}`)}
            opponentPrediction={
              opponent ? predByKey.get(`${opponent.id}:${match.id}`) : undefined
            }
            onSave={onSave}
          />
        ))}
      </div>
    </section>
  );
}
