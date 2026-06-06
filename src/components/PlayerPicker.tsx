import type { Player } from '../lib/types.ts';

interface Props {
  players: Player[];
  onPick: (id: number) => void;
}

export function PlayerPicker({ players, onPick }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-700 to-red-600 p-6 text-center text-white">
      <svg
        className="mb-4 h-14 w-14 text-amber-300"
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
      <h1 className="font-display text-4xl font-extrabold uppercase leading-none tracking-tight">
        Прогнозы ЧМ-2026
      </h1>
      <p className="mb-8 mt-2 text-red-100">Выбери, кто ты</p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {players.map((player) => (
          <button
            key={player.id}
            type="button"
            onClick={() => onPick(player.id)}
            className="cursor-pointer rounded-2xl bg-white py-4 font-display text-2xl font-bold uppercase tracking-wide text-red-700 shadow-lg transition-colors hover:bg-amber-300 hover:text-red-900"
          >
            {player.name}
          </button>
        ))}
      </div>
    </div>
  );
}
