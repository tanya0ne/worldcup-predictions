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

// Short labels for the stage tab strip.
export const STAGE_SHORT: Record<Stage, string> = {
  group: 'Группы',
  r32: '1/16',
  r16: '1/8',
  qf: '1/4',
  sf: '1/2',
  third: '3-е место',
  final: 'Финал',
};

const STAGE_ORDER: Stage[] = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];

export function stageRank(stage: Stage): number {
  return STAGE_ORDER.indexOf(stage);
}
