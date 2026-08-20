'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Home,
  AlertTriangle,
  Clock,
  Trophy,
  Star,
  BookOpen,
} from 'lucide-react';
import {
  loadProgress,
  recordRoundResult,
  getRankByScore,
  getNextRank,
  formatTime,
  RANKS,
  SCORE_PER_QUESTION,
  type QuizProgress,
} from '@/lib/knowledge/progress';
import { parseExplanation } from '@/lib/knowledge/repo';
import { useAuth } from '@/components/auth/auth-provider';
import { readToken } from '@/lib/auth/token';
import type { Option, Question } from '@/lib/knowledge/types';

type Phase = 'loading' | 'ready' | 'error' | 'result' | 'submitting';

interface AnswerRecord {
  questionId: number;
  question: string;
  picked: string | null;
  correct: string | null;
  isRight: boolean;
  explanation: string | null;
  sources: Question['sources'];
  options: Option[];
}

interface Props {
  ageGroup?: string;
  category?: string;
  embedded?: boolean;
  onExit?: () => void;
  onBrowse?: () => void;
}

function getCorrectLabel(q: Question): string | null {
  if (q.options && q.options.length > 0) {
    const c = q.options.find((o) => o.is_correct);
    if (c) return c.option_label;
  }
  return q.answer ?? null;
}

export function YuerQuizPanel({
  ageGroup,
  category,
  embedded = false,
  onExit,
  onBrowse,
}: Props) {
  const { user, updateUser } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const answersRef = useRef<AnswerRecord[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState<QuizProgress | null>(null);

  const current = questions[idx] ?? null;
  const correctLabel = useMemo(
    () => (current ? getCorrectLabel(current) : null),
    [current],
  );

  const loadQuiz = useCallback(async () => {
    setPhase('loading');
    setErrorMsg('');
    setIdx(0);
    setPicked(null);
    setLocked(false);
    setAnswers([]);
    answersRef.current = [];
    setElapsed(0);
    try {
      const params = new URLSearchParams({ size: '10' });
      if (ageGroup && ageGroup !== '全部') params.set('age_group', ageGroup);
      if (category && category !== '全部') params.set('category', category);
      const res = await fetch(`/api/knowledge/quiz?${params.toString()}`);
      const json = (await res.json()) as { data?: Question[]; error?: string };
      if (!res.ok || json.error) {
        throw new Error(json.error || '题目加载失败');
      }
      if (!json.data || json.data.length === 0) {
        setErrorMsg(
          '当前条件下还没有可作答的题目。题库正在陆续录入中，请稍后再来，或先到"浏览题库"查看全部题目。',
        );
        setPhase('error');
        return;
      }
      setQuestions(json.data);
      setPhase('ready');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '题目加载失败');
      setPhase('error');
    }
  }, [ageGroup, category]);

  useEffect(() => {
    setProgress(loadProgress());
    loadQuiz();
  }, [loadQuiz]);

  // 计时
  useEffect(() => {
    if (phase !== 'ready' || locked) return;
    const t = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase, locked, idx]);

  const handlePick = (label: string) => {
    if (locked || !current) return;
    setPicked(label);
    setLocked(true);

    const isRight = label === correctLabel;
    const record: AnswerRecord = {
      questionId: current.id,
      question: current.question,
      picked: label,
      correct: correctLabel,
      isRight,
      explanation: current.explanation,
      sources: current.sources ?? [],
      options: current.options ?? [],
    };
    setAnswers((a) => [...a, record]);
    answersRef.current = [...answersRef.current, record];
  };

  const goNext = () => {
    if (!current) return;
    // 以 ref 中的答案列表为准（避免 React state 异步更新导致的闭包旧值）
    const finalAnswers = answersRef.current;
    if (idx + 1 >= questions.length) {
      const finalCorrect = finalAnswers.filter((a) => a.isRight).length;
      setPhase('submitting');
      (async () => {
        const local = recordRoundResult(finalCorrect, questions.length);
        setProgress(local);
        // 异步提交到服务器（仅在已登录时）
        try {
          const token = readToken();
          if (token) {
            const res = await fetch('/api/knowledge/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                answers: finalAnswers.map((a) => ({
                  question_id: a.questionId,
                  selected_answer: a.picked ?? '',
                  is_correct: a.isRight,
                  score_earned: a.isRight ? SCORE_PER_QUESTION : 0,
                })),
              }),
            });
            if (res.ok) {
              const json = (await res.json()) as {
                result?: { total_score: number; rank_title: string; round_score: number };
              };
              if (json.result) {
                updateUser({
                  total_score: json.result.total_score,
                  rank_title: json.result.rank_title,
                });
              }
            }
          }
        } catch {
          // 网络失败时本地积分已记录，不阻塞结果展示
        }
        setPhase('result');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })();
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      setLocked(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ---------- loading / submitting ----------
  if (phase === 'loading' || phase === 'submitting') {
    return (
      <div className="flex min-h-[60dvh] w-full flex-col items-center justify-center px-5 py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary-dark" />
        <p className="mt-4 text-base font-semibold text-primary-dark">
          {phase === 'submitting' ? '正在提交本轮结果…' : '正在抽取题目…'}
        </p>
      </div>
    );
  }

  // ---------- error / empty ----------
  if (phase === 'error') {
    return (
      <div className="flex min-h-[60dvh] w-full flex-col items-center justify-center px-5 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FCE6D6]">
          <AlertTriangle className="h-8 w-8 text-accent" />
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-primary-dark">暂时无法答题</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {errorMsg}
        </p>
        <div className="mt-6 flex w-full max-w-[320px] flex-col gap-3">
          <button
            type="button"
            onClick={loadQuiz}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[28px] bg-primary-dark px-6 py-3 text-base font-bold text-white"
          >
            <RefreshCw size={18} />
            再试一次
          </button>
          <button
            type="button"
            onClick={() => onBrowse?.()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[28px] border-2 border-primary-dark bg-white px-6 py-3 text-base font-bold text-primary-dark"
          >
            <BookOpen size={18} />
            浏览题库
          </button>
          {embedded && onExit ? (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-muted-foreground"
            >
              <ArrowLeft size={16} />
              返回介绍
            </button>
          ) : (
            <Link
              href="/knowledge/yuer"
              className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-muted-foreground"
            >
              <ArrowLeft size={16} />
              返回介绍
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ---------- result ----------
  if (phase === 'result') {
    const finalAnswers = answersRef.current;
    const correctCount = finalAnswers.filter((a) => a.isRight).length;
    const total = questions.length;
    const accuracy = Math.round((correctCount / total) * 100);
    const gained = correctCount * SCORE_PER_QUESTION;
    const rank = progress ? getRankByScore(progress.totalScore) : RANKS[0];
    const nextRank = progress ? getNextRank(progress.totalScore) : null;
    const wrongList = finalAnswers.filter((a) => !a.isRight);

    return (
      <div className="w-full pb-10">
        <div className="rounded-md bg-gradient-to-br from-primary-dark to-[#636837] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between text-sm text-white/85">
            <span>本轮成绩{user ? ` · ${user.nickname}` : ''}</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} />
              {formatTime(elapsed)}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-6xl font-extrabold leading-none">{correctCount}</span>
            <span className="text-2xl font-bold text-white/80">/ {total}</span>
          </div>
          <div className="mt-1 text-base font-semibold text-white/85">
            正确率 {accuracy}%
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded bg-white/15 p-3 backdrop-blur-sm">
              <div className="text-xs text-white/75">本轮积分</div>
              <div className="mt-0.5 text-2xl font-extrabold">+{gained}</div>
            </div>
            <div className="rounded bg-white/15 p-3 backdrop-blur-sm">
              <div className="text-xs text-white/75">当前段位</div>
              <div className="mt-0.5 flex items-center gap-1 text-2xl font-extrabold">
                <span>{rank.emoji}</span>
                {rank.name}
              </div>
            </div>
          </div>

          {nextRank && progress && (
            <div className="mt-4 text-xs text-white/80">
              距 <span className="font-bold">{nextRank.emoji} {nextRank.name}</span> 还差{' '}
              <span className="font-bold">
                {nextRank.minScore - progress.totalScore}
              </span>{' '}
              分，再答 {Math.ceil((nextRank.minScore - progress.totalScore) / SCORE_PER_QUESTION)}{' '}
              道全对即可晋级
            </div>
          )}
        </div>

        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-primary-dark">
            <Trophy size={20} className="text-accent" />
            错题回顾
            <span className="text-sm font-normal text-muted-foreground">
              （{wrongList.length} 道）
            </span>
          </h2>

          {wrongList.length === 0 ? (
            <div className="mt-4 rounded bg-white p-6 text-center shadow-sm ring-1 ring-border">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary-dark" />
              <div className="mt-2 text-base font-bold text-primary-dark">
                全部答对，了不起！
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                要不要再来一组挑战一下？
              </div>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {wrongList.map((w, i) => {
                const exp = parseExplanation(w.explanation);
                return (
                  <li key={w.questionId} className="rounded bg-white p-4 shadow-sm ring-1 ring-border">
                    <div className="text-sm font-bold text-[#333]">
                      {i + 1}. {w.question}
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-danger">
                        <XCircle size={16} />
                        你的答案：{w.picked}
                      </div>
                      <div className="flex items-center gap-2 text-primary-dark">
                        <CheckCircle2 size={16} />
                        正确答案：{w.correct}
                      </div>
                    </div>
                    {exp.correct && (
                      <p className="mt-2 rounded bg-[#EDF1DC] p-2.5 text-[13px] leading-relaxed text-[#333]">
                        {exp.correct}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={loadQuiz}
            className="inline-flex items-center justify-center gap-2 rounded-[28px] bg-primary-dark px-5 py-3.5 text-base font-bold text-white shadow-md"
          >
            <RefreshCw size={18} />
            再来一组
          </button>
          <Link
            href="/knowledge/yuer"
            className="inline-flex items-center justify-center gap-2 rounded-[28px] border-2 border-primary-dark bg-white px-5 py-3.5 text-base font-bold text-primary-dark"
          >
            <Home size={18} />
            返回首页
          </Link>
        </div>

        {progress && (
          <div className="mt-6 rounded bg-white p-4 text-sm shadow-sm ring-1 ring-border">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary-dark">累计进度</span>
              <span className="text-muted-foreground">
                已答 {progress.answeredCount} 题 · 正确 {progress.correctCount} 题
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {RANKS.map((r) => {
                const reached = progress.totalScore >= r.minScore;
                return (
                  <span
                    key={r.name}
                    className={
                      'inline-flex items-center gap-0.5 rounded-md px-2.5 py-1 text-[11px] font-bold ' +
                      (reached
                        ? 'bg-primary-dark text-white'
                        : 'bg-muted text-muted-foreground')
                    }
                  >
                    <Star size={11} />
                    {r.emoji} {r.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------- quiz in progress ----------
  if (!current) return null;
  const exp = parseExplanation(current.explanation);
  const progressPercent = Math.round(((idx + (locked ? 1 : 0)) / questions.length) * 100);
  const currentRank = user
    ? { name: user.rank_title, emoji: '🏆' }
    : progress
      ? getRankByScore(progress.totalScore)
      : RANKS[0];
  const isJudge = current.question_type === 'judge';

  return (
    <div className="w-full pb-20">
      {/* 顶部状态条 */}
      <div className="sticky top-[64px] z-30 bg-background/95 pb-3 pt-2 backdrop-blur md:top-0">
        <div className="flex items-center justify-between text-sm font-bold">
          {embedded && onExit ? (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary-dark"
            >
              <ArrowLeft size={18} />
              退出
            </button>
          ) : (
            <Link
              href="/knowledge/yuer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary-dark"
            >
              <ArrowLeft size={18} />
              退出
            </Link>
          )}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-primary-dark shadow-sm ring-1 ring-border">
            <span>{currentRank.emoji}</span>
            <span>{currentRank.name}</span>
            <span className="text-muted-foreground">·</span>
            <span>{user?.total_score ?? progress?.totalScore ?? 0}分</span>
          </div>
          <div className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock size={14} />
            {formatTime(elapsed)}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E5E1C7]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="shrink-0 text-sm font-extrabold text-primary-dark">
            {idx + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div>
        {/* 标签 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {current.age_groups.map((ag) => (
            <span
              key={ag}
              className="rounded-full bg-[#FCE6D6] px-2.5 py-0.5 text-xs font-bold text-[#B85F30]"
            >
              {ag}
            </span>
          ))}
          {current.category && (
            <span className="rounded-full bg-[#EDF1DC] px-2.5 py-0.5 text-xs font-bold text-primary-dark">
              {current.category}
            </span>
          )}
          {current.question_type && (
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-muted-foreground ring-1 ring-border">
              {current.question_type}
            </span>
          )}
          {current.difficulty && (
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-muted-foreground ring-1 ring-border">
              {current.difficulty}
            </span>
          )}
        </div>

        {/* 题干 */}
        <h1 className="mt-4 text-[19px] font-bold leading-relaxed text-[#222]">
          {current.question}
        </h1>

        {/* 选项 */}
        <div className="mt-5 space-y-3">
          {(current.options ?? []).map((o) => {
            const isPicked = picked === o.option_label;
            const isCorrect = o.is_correct;
            const showCorrect = locked && isCorrect;
            const showWrong = locked && isPicked && !isCorrect;
            let cls =
              'border-2 border-border bg-white text-[#333] active:scale-[0.99]';
            if (showCorrect) {
              cls =
                'border-2 border-[#5A8F5E] bg-[#EDF7ED] text-[#2E5E3B] ring-2 ring-[#5A8F5E]/30';
            } else if (showWrong) {
              cls =
                'border-2 border-danger bg-[#FDE8E5] text-danger ring-2 ring-danger/20';
            } else if (locked) {
              cls = 'border-2 border-border bg-[#F8F7EE] text-muted-foreground';
            }
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => handlePick(o.option_label)}
                disabled={locked}
                aria-pressed={isPicked}
                className={
                  'flex w-full items-start gap-3 rounded px-4 py-4 text-left text-[17px] font-medium transition-all duration-200 ' +
                  cls
                }
                style={{ minHeight: 56 }}
              >
                <span
                  className={
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-extrabold ' +
                    (showCorrect
                      ? 'bg-[#5A8F5E] text-white'
                      : showWrong
                        ? 'bg-danger text-white'
                        : 'bg-primary/30 text-primary-dark')
                  }
                >
                  {showCorrect ? (
                    <CheckCircle2 size={20} />
                  ) : showWrong ? (
                    <XCircle size={20} />
                  ) : (
                    o.option_label
                  )}
                </span>
                <span className="flex-1 leading-relaxed">{o.content}</span>
              </button>
            );
          })}

          {/* 判断题无选项时兜底 */}
          {isJudge && (!current.options || current.options.length === 0) && (
            <div className="grid grid-cols-2 gap-3">
              {['A', 'B'].map((label) => {
                const isPicked = picked === label;
                const showCorrect = locked && correctLabel === label;
                const showWrong = locked && isPicked && correctLabel !== label;
                const text = label === 'A' ? '正确' : '错误';
                let cls =
                  'border-2 border-border bg-white text-[#333]';
                if (showCorrect) cls = 'border-2 border-[#5A8F5E] bg-[#EDF7ED] text-[#2E5E3B]';
                else if (showWrong) cls = 'border-2 border-danger bg-[#FDE8E5] text-danger';
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handlePick(label)}
                    disabled={locked}
                    className={
                      'flex h-20 items-center justify-center gap-2 rounded text-xl font-extrabold transition ' +
                      cls
                    }
                  >
                    {showCorrect ? <CheckCircle2 size={24} /> : showWrong ? <XCircle size={24} /> : null}
                    {text}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 答题后反馈 */}
        {locked && (
          <div className="mt-5 space-y-3">
            <div
              className={
                'flex items-center gap-2 rounded p-3 text-base font-bold ' +
                (picked === correctLabel
                  ? 'bg-[#EDF7ED] text-[#2E5E3B]'
                  : 'bg-[#FDE8E5] text-danger')
              }
            >
              {picked === correctLabel ? (
                <>
                  <CheckCircle2 size={22} />
                  回答正确！+{SCORE_PER_QUESTION} 分
                </>
              ) : (
                <>
                  <XCircle size={22} />
                  回答错误，正确答案是 {correctLabel}
                </>
              )}
            </div>

            {exp.correct && (
              <section className="rounded bg-white p-4 shadow-sm ring-1 ring-border">
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-primary-dark">
                  <CheckCircle2 size={16} />
                  正确做法
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#333]">
                  {exp.correct}
                </p>
              </section>
            )}
            {exp.distractor && (
              <section className="rounded bg-white p-4 shadow-sm ring-1 ring-border">
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-accent">
                  <XCircle size={16} />
                  干扰项为什么错
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#333]">
                  {exp.distractor}
                </p>
              </section>
            )}
            {exp.doctor && (
              <section className="rounded border-l-4 border-danger bg-[#FDE8E5]/60 p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-danger">
                  <AlertTriangle size={16} />
                  何时需要看医生
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#333]">
                  {exp.doctor}
                </p>
              </section>
            )}

            {/* 来源卡片 */}
            {current.sources && current.sources.length > 0 && (
              <section className="rounded bg-[#F6F6E8]/70 p-4 ring-1 ring-primary/30">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-dark">
                  权威来源
                </h3>
                <ul className="mt-2 space-y-3">
                  {current.sources.map((s) => {
                    const m = current.source_maps?.find((x) => x.source_id === s.id);
                    return (
                      <li key={s.id} className="text-[13px] leading-relaxed">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-extrabold text-primary-dark">
                            来源
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-[#333]">{s.short_name}</div>
                            <div className="text-muted-foreground">
                              {s.org_name}
                              {s.year ? ` · ${s.year}` : ''}
                              {s.official_url && (
                                <>
                                  {' · '}
                                  <a
                                    href={s.official_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary-dark underline"
                                  >
                                    查看原文
                                  </a>
                                </>
                              )}
                            </div>
                            {m?.anchor_text && (
                              <blockquote className="mt-1.5 border-l-2 border-primary/50 bg-white/60 px-2.5 py-1.5 text-[12.5px] italic text-[#444]">
                                “{m.anchor_text}”
                              </blockquote>
                            )}
                            {m?.information_points && m.information_points.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {m.information_points.slice(0, 5).map((p) => (
                                  <span
                                    key={p}
                                    className="rounded bg-white/70 px-1.5 py-0.5 text-[11px] text-primary-dark ring-1 ring-primary/20"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <button
              type="button"
              onClick={goNext}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[28px] bg-primary-dark px-6 py-4 text-base font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
            >
              {idx + 1 >= questions.length ? '查看结果' : '下一题'}
              <ArrowRight size={20} strokeWidth={2.8} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
