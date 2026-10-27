import type { Match, DetailedAnalysis } from './types';

export const MOCK_MATCHES: Match[] = [
  {
    id: 4001,
    competition: { id: 2021, name: 'Premier League', code: 'PL' },
    utcDate: '2026-10-27T19:00:00Z',
    status: 'TIMED',
    homeTeam: {
      id: 65,
      name: 'Manchester City FC',
      shortName: 'Man City',
      tla: 'MCI',
      crest: 'https://crests.football-data.org/65.png'
    },
    awayTeam: {
      id: 57,
      name: 'Arsenal FC',
      shortName: 'Arsenal',
      tla: 'ARS',
      crest: 'https://crests.football-data.org/57.png'
    }
  },
  {
    id: 4002,
    competition: { id: 2014, name: 'La Liga', code: 'PD' },
    utcDate: '2026-10-27T21:00:00Z',
    status: 'TIMED',
    homeTeam: {
      id: 86,
      name: 'Real Madrid CF',
      shortName: 'Real Madrid',
      tla: 'RMA',
      crest: 'https://crests.football-data.org/86.png'
    },
    awayTeam: {
      id: 77,
      name: 'Athletic Club',
      shortName: 'Athletic',
      tla: 'ATH',
      crest: 'https://crests.football-data.org/77.png'
    }
  },
  {
    id: 4003,
    competition: { id: 2015, name: 'Ligue 1', code: 'FL1' },
    utcDate: '2026-10-27T17:00:00Z',
    status: 'IN_PLAY',
    homeTeam: {
      id: 524,
      name: 'Paris Saint-Germain FC',
      shortName: 'PSG',
      tla: 'PSG',
      crest: 'https://crests.football-data.org/524.png'
    },
    awayTeam: {
      id: 516,
      name: 'Olympique de Marseille',
      shortName: 'Marseille',
      tla: 'OM',
      crest: 'https://crests.football-data.org/516.png'
    },
    score: { fullTime: { home: 1, away: 0 } }
  }
];

export const MOCK_ANALYSIS: DetailedAnalysis = {
  matchId: 4001,
  probabilities: {
    homeWin: 48.2,
    draw: 27.1,
    awayWin: 24.7,
    over15: 78.4,
    over25: 54.1,
    bttsYes: 58.9,
    bttsNo: 41.1,
    expectedGoalsHome: 1.84,
    expectedGoalsAway: 1.18,
    topScores: [
      { score: '1 - 1', probability: 12.8 },
      { score: '2 - 1', probability: 11.4 },
      { score: '1 - 0', probability: 9.7 },
      { score: '2 - 0', probability: 8.9 },
      { score: '0 - 1', probability: 6.8 }
    ]
  },
  homeForm: ['W', 'W', 'D', 'W', 'L'],
  awayForm: ['W', 'D', 'W', 'W', 'W'],
  sampleMatchesCount: 38,
  confidenceScore: 84,
  insights: [
    'Manchester City marque en moyenne 2.3 buts à domicile cette saison.',
    'Arsenal concède moins de 1 but par rencontre en déplacement.',
    'Le score 1-1 présente la plus forte probabilité brute selon la loi de Poisson (12.8%).',
    'Indice Over 1.5 très élevé (78.4%).'
  ]
};

export const MOCK_HISTORY = [
  { id: '1', date: '2026-10-24', match: 'Arsenal FC vs Chelsea FC', market: 'Plus de 2.5 buts', prob: '62.4%', result: '3 - 1', won: true },
  { id: '2', date: '2026-10-23', match: 'Real Madrid vs Athletic', market: 'Victoire Domicile (1)', prob: '58.7%', result: '2 - 0', won: true },
  { id: '3', date: '2026-10-22', match: 'Juventus vs Milan', market: 'BTTS - Les 2 marquent', prob: '55.1%', result: '0 - 0', won: false }
];