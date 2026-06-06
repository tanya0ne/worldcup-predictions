interface Props {
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function ScoreStepper({ label, value, disabled, onChange }: Props) {
  const clamp = (n: number) => Math.max(0, Math.min(99, n));
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`${label}: меньше`}
      >
        −
      </button>
      <span className="w-8 text-center font-display text-3xl font-extrabold tabular-nums text-slate-900">
        {value}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600 transition-colors hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`${label}: больше`}
      >
        +
      </button>
    </div>
  );
}
