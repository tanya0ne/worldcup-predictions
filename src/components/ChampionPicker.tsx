import { useEffect, useMemo, useState } from 'react';
import { isTournamentDayReached } from '../lib/time.ts';
import type { ChampionBet, Match, Player } from '../lib/types.ts';

interface Props {
  me: Player;
  opponent: Player | undefined;
  matches: Match[];
  championBets: ChampionBet[];
  onSave: (team: string) => Promise<void>;
}

// Champion options = real national teams only. Group-stage matches carry the
// actual country names; knockout matches use bracket placeholders ("2A",
// "3ABCDF", "To be announced") which must never appear as champion choices.
function teamOptions(matches: Match[]): string[] {
  const set = new Set<string>();
  for (const m of matches) {
    if (m.stage !== 'group') continue;
    set.add(m.home_team);
    set.add(m.away_team);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function ChampionPicker({ me, opponent, matches, championBets, onSave }: Props) {
  const teams = useMemo(() => teamOptions(matches), [matches]);
  // Champion locks from the start of the tournament's first match day — picking
  // is only allowed before then (otherwise you'd switch to whoever is winning).
  const locked = useMemo(() => isTournamentDayReached(matches.map((m) => m.kickoff_at)), [matches]);

  const myBet = championBets.find((b) => b.player_id === me.id);
  const oppBet = opponent
    ? championBets.find((b) => b.player_id === opponent.id)
    : undefined;

  const [team, setTeam] = useState(myBet?.team ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setTeam(myBet?.team ?? '');
  }, [myBet?.team]);

  async function save() {
    if (!team) return;
    setSaving(true);
    setErr(null);
    try {
      await onSave(team);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-amber-200/70 px-4 py-3">
        <StarIcon className="h-5 w-5 text-amber-500" />
        <h2 className="text-xl font-bold uppercase text-slate-800">Чемпион турнира</h2>
        <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-900">
          +25 очков
        </span>
      </div>

      <div className="p-4">
        <p className="mb-3 text-sm text-slate-600">
          {locked
            ? 'Турнир начался — выбор чемпиона зафиксирован, поменять уже нельзя.'
            : 'Один выбор на весь турнир, только до старта (первого матча). Угадаешь чемпиона — большой бонус. После начала турнира поменять будет нельзя.'}
        </p>

        {teams.length === 0 ? (
          <p className="text-sm text-slate-500">Список команд появится после загрузки матчей.</p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="champion-select">
              Команда-чемпион
            </label>
            <select
              id="champion-select"
              value={team}
              disabled={locked}
              onChange={(e) => setTeam(e.target.value)}
              className="flex-1 cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">— выбери команду —</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={locked || !team || team === myBet?.team || saving}
              onClick={save}
              className="cursor-pointer rounded-xl bg-amber-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? 'Сохраняю…' : 'Сохранить'}
            </button>
          </div>
        )}

        {err && <p className="mt-2 text-sm font-medium text-red-600">{err}</p>}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ChampionRow name={me.name} team={myBet?.team} highlight />
          <ChampionRow name={opponent?.name ?? 'Соперник'} team={oppBet?.team} />
        </div>
      </div>
    </section>
  );
}

function ChampionRow({ name, team, highlight }: { name: string; team?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-2.5 ${highlight ? 'bg-amber-100/70' : 'bg-white'} border border-amber-200/60`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{name}</div>
      <div className="font-semibold text-slate-800">{team ?? '—'}</div>
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.98 6.1 20.17l1.13-6.57L2.45 8.94l6.6-.96L12 2z" />
    </svg>
  );
}
