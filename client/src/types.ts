export type PageId = 'dashboard' | 'matches' | 'analysis' | 'predictions' | 'history' | 'profile' | 'admin';

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Match {
  id: number;
  competition: {
    id: number;
    name: string;
    code: string;
    emblem?: string;
  };
  utcDate: string;
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED';
  homeTeam: Team;
  awayTeam: Team;
  score?: {
    fullTime: { home: number | null; away: number | null };
  };
}

export interface DetailedAnalysis {
  matchId: number;
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
    over15: number;
    over25: number;
    bttsYes: number;
    bttsNo: number;
    expectedGoalsHome: number;
    expectedGoalsAway: number;
    topScores: { score: string; probability: number }[];
  };
  homeForm: ('W' | 'D' | 'L')[];
  awayForm: ('W' | 'D' | 'L')[];
  sampleMatchesCount: number;
  confidenceScore: number;
  insights: string[];
}