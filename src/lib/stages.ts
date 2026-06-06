import type { Stage } from './types.ts';

export const STAGE_LABELS: Record<Stage, string> = {
  group: 'Групповой этап',
  r32: '1/16 финала',
  r16: '1/8 финала',
  qf: 'Четвертьфинал',
  sf: 'Полуфинал',
  third: 'Матч за 3-е место',
  final: 'Финал',
};

const STAGE_ORDER: Stage[] = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];

export function stageRank(stage: Stage): number {
  return STAGE_ORDER.indexOf(stage);
}
