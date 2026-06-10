interface Rule {
  pts: string;
  title: string;
  desc: string;
  tone: 'green' | 'amber' | 'slate';
}

const RULES: Rule[] = [
  { pts: '3', title: 'Точный счёт', desc: 'Угадал и счёт, и исход (прогноз 2:1, матч 2:1)', tone: 'green' },
  { pts: '2', title: 'Разница мячей', desc: 'Угадал разницу и исход, но не счёт (прогноз 2:1, матч 3:2)', tone: 'amber' },
  { pts: '1', title: 'Исход', desc: 'Угадал только победу / ничью / поражение', tone: 'amber' },
  { pts: '0', title: 'Мимо', desc: 'Исход не угадан', tone: 'slate' },
];

const toneClasses: Record<Rule['tone'], string> = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-200 text-slate-500',
};

export function ScoringRules() {
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-4 py-3 text-xl font-bold uppercase text-slate-800">
          Очки за матч
        </h2>
        <ul className="divide-y divide-slate-100">
          {RULES.map((r) => (
            <li key={r.title} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-xl font-extrabold ${toneClasses[r.tone]}`}
              >
                {r.pts}
              </span>
              <div>
                <div className="font-semibold text-slate-800">{r.title}</div>
                <div className="text-sm text-slate-500">{r.desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 font-display text-lg font-extrabold text-amber-900">
            +25
          </span>
          <div>
            <div className="font-semibold text-slate-800">Чемпион турнира</div>
            <div className="text-sm text-slate-600">Угадал победителя ЧМ — большой бонус</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <h3 className="mb-2 font-bold uppercase text-slate-800">Когда закрывается приём</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Прогноз на матч — с начала дня матча (по испанскому времени).</li>
          <li>Чемпион — с начала дня первого матча турнира.</li>
          <li>Каждый правит только свои прогнозы — по своему PIN-коду.</li>
        </ul>
      </section>
    </div>
  );
}
