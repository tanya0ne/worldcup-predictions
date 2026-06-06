import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  CHAMPION_BONUS,
  championOf,
  computeStandings,
  scoreMatch,
} from './scoring.ts';
import type { ChampionBet, Match, Prediction } from './types.ts';

test('scoreMatch: exact score = 3', () => {
  assert.equal(scoreMatch({ home: 2, away: 1 }, { home: 2, away: 1 }), 3);
});

test('scoreMatch: right goal difference and outcome = 2', () => {
  assert.equal(scoreMatch({ home: 2, away: 1 }, { home: 3, away: 2 }), 2);
});

test('scoreMatch: only outcome right = 1', () => {
  assert.equal(scoreMatch({ home: 2, away: 0 }, { home: 1, away: 0 }), 1);
});

test('scoreMatch: miss = 0', () => {
  assert.equal(scoreMatch({ home: 2, away: 0 }, { home: 0, away: 1 }), 0);
});

test('scoreMatch: draw 1:1 vs 2:2 = 2 (diff matches, not exact)', () => {
  assert.equal(scoreMatch({ home: 1, away: 1 }, { home: 2, away: 2 }), 2);
});

test('scoreMatch: exact draw = 3', () => {
  assert.equal(scoreMatch({ home: 1, away: 1 }, { home: 1, away: 1 }), 3);
});

function match(over: Partial<Match>): Match {
  return {
    id: 'm1',
    stage: 'group',
    group_label: 'A',
    home_team: 'A',
    away_team: 'B',
    kickoff_at: null,
    home_score: null,
    away_score: null,
    winner: null,
    status: 'scheduled',
    updated_at: '2026-06-01T00:00:00Z',
    ...over,
  };
}

test('championOf: explicit winner field (final decided on penalties)', () => {
  const final = match({
    id: 'f',
    stage: 'final',
    home_team: 'Бразилия',
    away_team: 'Франция',
    home_score: 1,
    away_score: 1,
    winner: 'Франция',
    status: 'finished',
  });
  assert.equal(championOf([final]), 'Франция');
});

test('championOf: winner null + unequal score → higher-scoring team', () => {
  const final = match({
    id: 'f',
    stage: 'final',
    home_team: 'Бразилия',
    away_team: 'Франция',
    home_score: 2,
    away_score: 0,
    winner: null,
    status: 'finished',
  });
  assert.equal(championOf([final]), 'Бразилия');
});

test('championOf: no finished final → null', () => {
  const final = match({ id: 'f', stage: 'final', status: 'scheduled' });
  assert.equal(championOf([final]), null);
});

test('computeStandings: champion bonus added on correct bet', () => {
  const players = [{ id: 1 }, { id: 2 }];
  const matches: Match[] = [
    match({
      id: 'f',
      stage: 'final',
      home_team: 'Бразилия',
      away_team: 'Франция',
      home_score: 2,
      away_score: 0,
      status: 'finished',
    }),
  ];
  const predictions: Prediction[] = [
    { player_id: 1, match_id: 'f', pred_home: 2, pred_away: 0, updated_at: '' },
  ];
  const bets: ChampionBet[] = [
    { player_id: 1, team: 'Бразилия', updated_at: '' },
    { player_id: 2, team: 'Франция', updated_at: '' },
  ];

  const standings = computeStandings(players, matches, predictions, bets);
  const p1 = standings.find((s) => s.playerId === 1)!;
  const p2 = standings.find((s) => s.playerId === 2)!;

  assert.equal(p1.championPoints, CHAMPION_BONUS);
  assert.equal(p1.playoffPoints, 3); // exact score on the final
  assert.equal(p1.total, CHAMPION_BONUS + 3);
  assert.equal(p2.championPoints, 0);
  assert.equal(p2.total, 0);
});

test('computeStandings: splits group vs playoff points, ignores unplayed', () => {
  const players = [{ id: 1 }];
  const matches: Match[] = [
    match({ id: 'g', stage: 'group', home_score: 1, away_score: 0, status: 'finished' }),
    match({ id: 'qf', stage: 'qf', home_score: 3, away_score: 1, status: 'finished' }),
    match({ id: 'sf', stage: 'sf', status: 'scheduled' }),
  ];
  const predictions: Prediction[] = [
    { player_id: 1, match_id: 'g', pred_home: 1, pred_away: 0, updated_at: '' }, // exact = 3
    { player_id: 1, match_id: 'qf', pred_home: 2, pred_away: 0, updated_at: '' }, // diff 2 vs 2 = 2
    { player_id: 1, match_id: 'sf', pred_home: 1, pred_away: 1, updated_at: '' }, // unplayed → 0
  ];

  const standings = computeStandings(players, matches, predictions, []);
  const p1 = standings[0];
  assert.equal(p1.groupPoints, 3);
  assert.equal(p1.playoffPoints, 2);
  assert.equal(p1.championPoints, 0);
  assert.equal(p1.total, 5);
});
