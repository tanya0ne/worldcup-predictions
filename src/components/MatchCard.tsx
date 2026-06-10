import { useEffect, useState } from 'react';
import { scoreMatch } from '../lib/scoring.ts';
import { isMatchDayReached } from '../lib/time.ts';
import type { Match, Player, Prediction } from '../lib/types.ts';
import { ScoreStepper } from './ScoreStepper.tsx';

interface Props {
  match: Match;
  me: Player;
  opponent: Player | undefined;
  myPrediction: Prediction | undefined;
  opponentPrediction: Prediction | undefined;
  onSave: (matchId: string, predHome: number, predAway: number) => Promise<void>;
}

function isFinished(match: Match): boolean {
  return match.status === 'finished' && match.home_score !== null && match.away_score !== null;
}

// Predictions lock from the START of the match day (not at kickoff) — no editing
// on the day the match is played. Mirrors the Supabase save_prediction check.
function isLocked(match: Match): boolean {
  if (isFinished(match)) return true;
  return isMatchDayReached(match.kickoff_at);
}

function pointsFor(match: Match, pred: Prediction | undefined): number | null {
  if (!pred || !isFinished(match)) return null;
  return scoreMatch(
    { home: pred.pred_home, away: pred.pred_away },
    { home: match.home_score as number, away: match.away_score as number },
  );
}

function formatKickoff(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MatchCard({
  match,
  me,
  opponent,
  myPrediction,
  opponentPrediction,
  onSave,
}: Props) {
  const finished = isFinished(match);
  const locked = isLocked(match);
  const [home, setHome] = useState(myPrediction?.pred_home ?? 0);
  const [away, setAway] = useState(myPrediction?.pred_away ?? 0);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setHome(myPrediction?.pred_home ?? 0);
    setAway(myPrediction?.pred_away ?? 0);
  }, [myPrediction?.pred_home, myPrediction?.pred_away]);

  // If there's no saved prediction yet, allow saving even the default 0:0.
  // Once saved, the button only re-enables when the score actually changes.
  const dirty = myPrediction
    ? home !== myPrediction.pred_home || away !== myPrediction.pred_away
    : true;

  async function save() {
    setSaving(true);
    setSavedAt(false);
    setErr(null);
    try {
      await onSave(match.id, home, away);
      setSavedAt(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  const myPoints = pointsFor(match, myPrediction);
  const oppPoints = pointsFor(match, opponentPrediction);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex-1 truncate text-right font-semibold text-slate-800">
          {match.home_team}
        </span>
        {finished ? (
          <span className="font-display text-xl font-extrabold tabular-nums text-slate-900">
            {match.home_score}:{match.away_score}
          </span>
        ) : (
          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400">
            {formatKickoff(match.kickoff_at) || 'VS'}
          </span>
        )}
        <span className="flex-1 truncate font-semibold text-slate-800">{match.away_team}</span>
      </div>

      {finished && match.winner && (
        <div className="mb-2 text-center text-xs font-medium text-slate-500">
          Победитель: {match.winner}
        </div>
      )}

      <div className="flex items-center justify-center gap-5">
        <ScoreStepper label={match.home_team} value={home} disabled={locked} onChange={setHome} />
        <span className="font-display text-2xl font-extrabold text-slate-300">:</span>
        <ScoreStepper label={match.away_team} value={away} disabled={locked} onChange={setAway} />
      </div>

      {!locked && (
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={save}
          className="mt-3 w-full cursor-pointer rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Сохраняю…' : savedAt && !dirty ? 'Сохранено ✓' : 'Сохранить прогноз'}
        </button>
      )}

      {locked && !finished && (
        <p className="mt-2 text-center text-xs text-slate-400">
          В день матча менять прогноз уже нельзя
        </p>
      )}

      {err && <p className="mt-2 text-center text-xs font-medium text-red-600">{err}</p>}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <PredictionRow name={me.name} pred={myPrediction} points={myPoints} highlight />
        <PredictionRow name={opponent?.name ?? 'Соперник'} pred={opponentPrediction} points={oppPoints} />
      </div>
    </div>
  );
}

function PredictionRow({
  name,
  pred,
  points,
  highlight,
}: {
  name: string;
  pred: Prediction | undefined;
  points: number | null;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${highlight ? 'bg-red-50' : 'bg-slate-50'}`}>
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
          {name}
        </div>
        <div className="tabular-nums text-slate-800">
          {pred ? `${pred.pred_home} : ${pred.pred_away}` : '—'}
        </div>
      </div>
      {points !== null && (
        <span
          className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
            points > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
          }`}
        >
          +{points}
        </span>
      )}
    </div>
  );
}
