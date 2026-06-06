import { useState } from 'react';
import type { Player } from '../lib/types.ts';

interface Props {
  players: Player[];
  // Verifies/claims the PIN, then signs in. Throws on wrong PIN.
  authenticate: (playerId: number, pin: string) => Promise<void>;
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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

export function PlayerPicker({ players, authenticate }: Props) {
  const [selected, setSelected] = useState<Player | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function pick(player: Player) {
    setSelected(player);
    setPin('');
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || pin.length < 4) return;
    setBusy(true);
    setError(null);
    try {
      await authenticate(selected.id, pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти');
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-700 to-red-600 p-6 text-center text-white">
      <TrophyIcon className="mb-4 h-14 w-14 text-amber-300" />
      <h1 className="font-display text-4xl font-extrabold uppercase leading-none tracking-tight">
        Прогнозы ЧМ-2026
      </h1>

      {!selected ? (
        <>
          <p className="mb-8 mt-2 text-red-100">Выбери, кто ты</p>
          <div className="flex w-full max-w-xs flex-col gap-3">
            {players.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => pick(player)}
                className="cursor-pointer rounded-2xl bg-white py-4 font-display text-2xl font-bold uppercase tracking-wide text-red-700 shadow-lg transition-colors hover:bg-amber-300 hover:text-red-900"
              >
                {player.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={submit} className="mt-6 flex w-full max-w-xs flex-col gap-3">
          <p className="text-red-100">
            {selected.name}, введи свой PIN-код
          </p>
          <input
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="• • • •"
            aria-label="PIN-код"
            className="rounded-2xl bg-white px-4 py-4 text-center font-display text-3xl font-bold tracking-[0.3em] text-red-700 outline-none placeholder:text-red-200"
          />
          <p className="text-xs text-red-100/90">
            Первый раз — придумай 4-значный код, он запомнится на этом телефоне. В следующий раз
            введи этот же. Код защищает твои ставки — другой игрок не сможет их менять.
          </p>
          {error && <p className="rounded-lg bg-white/15 px-3 py-2 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            disabled={pin.length < 4 || busy}
            className="cursor-pointer rounded-2xl bg-amber-400 py-3.5 font-display text-xl font-bold uppercase tracking-wide text-red-900 shadow-lg transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Вхожу…' : 'Войти'}
          </button>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="cursor-pointer text-sm text-red-100 underline"
          >
            ← назад
          </button>
        </form>
      )}
    </div>
  );
}
