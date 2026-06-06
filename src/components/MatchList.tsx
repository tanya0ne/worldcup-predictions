import { useMemo } from 'react';
import { STAGE_LABELS, stageRank } from '../lib/stages.ts';
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
  title: string;
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
    const key = stage === 'group' ? `group-${match.group_label ?? '?'}` : stage;
    const title =
      stage === 'group'
        ? `Группа ${match.group_label ?? '?'}`
        : STAGE_LABELS[stage];

    let idx = indexByKey.get(key);
    if (idx === undefined) {
      idx = groups.length;
      indexByKey.set(key, idx);
      groups.push({ key, title, matches: [] });
    }
    groups[idx].matches.push(match);
  }
  return groups;
}

export function MatchList({ matches, me, opponent, predictions, onSave }: Props) {
  const groups = useMemo(() => groupMatches(matches), [matches]);

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

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-2.5 flex items-center gap-2 px-1">
            <span className="h-5 w-1.5 rounded-full bg-red-600" />
            <span className="text-xl font-bold uppercase tracking-tight text-slate-800">
              {group.title}
            </span>
          </h2>
          <div className="space-y-3">
            {group.matches.map((match) => (
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
      ))}
    </div>
  );
}
