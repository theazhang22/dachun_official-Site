'use client';

const STORAGE_KEY = 'dachun-quiz-progress-v1';

export interface QuizProgress {
  totalScore: number;
  correctCount: number;
  answeredCount: number;
  currentRankIndex: number;
  bestStreak: number;
  lastUpdated: number;
}

export interface Rank {
  name: string;
  minScore: number;
  color: string;
  bg: string;
  emoji: string;
}

// 每题 10 分
export const SCORE_PER_QUESTION = 10;

export const RANKS: Rank[] = [
  { name: '学童', minScore: 0, color: '#8B7355', bg: '#F5EFE6', emoji: '🌱' },
  { name: '书生', minScore: 50, color: '#5E7A52', bg: '#EDF3E8', emoji: '📖' },
  { name: '秀才', minScore: 150, color: '#3F7A4E', bg: '#E2F0E4', emoji: '🎋' },
  { name: '举人', minScore: 400, color: '#B8860B', bg: '#FBF3D8', emoji: '🏮' },
  { name: '进士', minScore: 800, color: '#B85F30', bg: '#FCE6D6', emoji: '🎓' },
  { name: '状元', minScore: 1500, color: '#C84B3A', bg: '#FAD9D2', emoji: '👑' },
];

export function getRankByScore(score: number): Rank {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (score >= r.minScore) rank = r;
  }
  return rank;
}

export function getNextRank(score: number): Rank | null {
  for (const r of RANKS) {
    if (score < r.minScore) return r;
  }
  return null;
}

const defaultProgress: QuizProgress = {
  totalScore: 0,
  correctCount: 0,
  answeredCount: 0,
  currentRankIndex: 0,
  bestStreak: 0,
  lastUpdated: Date.now(),
};

export function loadProgress(): QuizProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<QuizProgress>;
    return {
      ...defaultProgress,
      ...parsed,
      lastUpdated: parsed.lastUpdated ?? Date.now(),
    };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(p: QuizProgress): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function recordRoundResult(correct: number, total: number): QuizProgress {
  const current = loadProgress();
  const gained = correct * SCORE_PER_QUESTION;
  const next: QuizProgress = {
    ...current,
    totalScore: current.totalScore + gained,
    correctCount: current.correctCount + correct,
    answeredCount: current.answeredCount + total,
    lastUpdated: Date.now(),
  };
  const rank = getRankByScore(next.totalScore);
  next.currentRankIndex = RANKS.indexOf(rank);
  saveProgress(next);
  return next;
}

export function resetProgress(): QuizProgress {
  saveProgress(defaultProgress);
  return defaultProgress;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
