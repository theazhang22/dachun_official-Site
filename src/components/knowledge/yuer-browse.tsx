'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  CheckCircle2,
  FileText,
  Tag,
} from 'lucide-react';
import {
  AGE_GROUPS,
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  difficultyLabel,
  questionTypeLabel,
  parseExplanation,
} from '@/lib/knowledge/repo';
import { CATEGORY_DEFS } from '@/lib/knowledge/taxonomy';
import type { Question } from '@/lib/knowledge/types';

const PAGE_SIZE = 10;

interface ListResponse {
  data: Question[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface Props {
  initialCategory?: string;
  onStartQuiz?: (category?: string) => void;
}

export function YuerBrowsePanel({ initialCategory, onStartQuiz }: Props) {
  const normalizeCategory = (c?: string): string => {
    if (!c) return '全部';
    if (CATEGORY_DEFS.some((d) => d.value === c)) return c;
    // 兼容中文 label 传参
    const byLabel = CATEGORY_DEFS.find((d) => d.label === c);
    return byLabel?.value ?? c;
  };

  const [age, setAge] = useState<string>('全部');
  const [difficulty, setDifficulty] = useState<string>('全部');
  const [qtype, setQtype] = useState<string>('全部');
  const [category, setCategory] = useState<string>(normalizeCategory(initialCategory));
  const [keyword, setKeyword] = useState<string>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Question | null>(null);

  useEffect(() => {
    if (initialCategory) setCategory(normalizeCategory(initialCategory));
  }, [initialCategory]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(PAGE_SIZE));
      if (age !== '全部') params.set('age_group', age);
      if (difficulty !== '全部') params.set('difficulty', difficulty);
      if (qtype !== '全部') params.set('question_type', qtype);
      if (category !== '全部') params.set('category', category);
      if (keyword.trim()) params.set('q', keyword.trim());

      const res = await fetch(`/api/knowledge/questions?${params.toString()}`);
      const json = (await res.json()) as ListResponse & { error?: string };
      if (!res.ok || json.error) throw new Error(json.error || '加载失败');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [age, difficulty, qtype, category, keyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 客户端按关键词过滤（因为后端 keyword 没做筛选，做在前端兜底）
  const filtered = (() => {
    if (!data?.data) return [];
    const k = keyword.trim().toLowerCase();
    if (!k) return data.data;
    return data.data.filter((q) => q.question.toLowerCase().includes(k));
  })();

  const resetFilters = () => {
    setAge('全部');
    setDifficulty('全部');
    setQtype('全部');
    setCategory('全部');
    setKeyword('');
    setPage(1);
  };

  return (
    <div className="w-full bg-background pb-20">
      <div className="bg-gradient-to-b from-[#EFEFD3] via-background to-background px-5 pb-5 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-primary-dark">题库浏览</h2>
          {onStartQuiz && (
            <button
              type="button"
              onClick={() => onStartQuiz(category !== '全部' ? category : undefined)}
              className="inline-flex items-center gap-1 rounded-full bg-primary-dark px-4 py-1.5 text-sm font-bold text-white"
            >
              开始答题
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          按年龄段、难度、题型筛选，点击题目查看答案与解析
        </p>

        {/* 搜索 */}
        <div className="mt-4 flex items-center gap-2 rounded bg-white px-3.5 py-2.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary-dark">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="search"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder="搜索题干关键词"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#333] outline-none placeholder:text-muted-foreground"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              aria-label="清除关键词"
              className="text-muted-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
        <FilterRow
          label="年龄"
          value={age}
          options={['全部', ...AGE_GROUPS]}
          onChange={(v) => {
            setAge(v);
            setPage(1);
          }}
        />
        <div className="mt-2.5">
          <FilterRow
            label="难度"
            value={difficultyLabel(difficulty) || '全部'}
            options={['全部', ...DIFFICULTY_OPTIONS.map((d) => d.label)]}
            onChange={(v) => {
              if (v === '全部') {
                setDifficulty('全部');
              } else {
                const hit = DIFFICULTY_OPTIONS.find((d) => d.label === v);
                setDifficulty(hit?.value ?? v);
              }
              setPage(1);
            }}
          />
        </div>
        <div className="mt-2.5">
          <FilterRow
            label="题型"
            value={questionTypeLabel(qtype) || '全部'}
            options={['全部', ...QUESTION_TYPE_OPTIONS.map((t) => t.label)]}
            onChange={(v) => {
              if (v === '全部') {
                setQtype('全部');
              } else {
                const hit = QUESTION_TYPE_OPTIONS.find((t) => t.label === v);
                setQtype(hit?.value ?? v);
              }
              setPage(1);
            }}
          />
        </div>

        {/* 分类标签云 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setCategory('全部');
              setPage(1);
            }}
            className={
              'rounded-md px-3 py-1 text-xs font-bold transition ' +
              (category === '全部'
                ? 'bg-primary-dark text-white'
                : 'bg-white text-muted-foreground ring-1 ring-border')
            }
          >
            全部分类
          </button>
          {CATEGORY_DEFS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setCategory(c.value);
                setPage(1);
              }}
              className={
                'rounded-md px-3 py-1 text-xs font-bold transition ' +
                (category === c.value
                  ? 'bg-primary-dark text-white'
                  : 'bg-white text-muted-foreground ring-1 ring-border')
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        {(age !== '全部' ||
          difficulty !== '全部' ||
          qtype !== '全部' ||
          category !== '全部') && (
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-accent"
          >
            <X size={12} />
            清除筛选
          </button>
        )}
      </div>

      {/* 列表 */}
      <div className="px-5 py-4">
        {loading ? (
          <div className="flex flex-col items-center py-16 text-primary-dark">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-3 text-sm font-semibold">加载中…</p>
          </div>
        ) : error ? (
          <div className="rounded bg-[#FCE6D6] p-4 text-sm text-[#B85F30]">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded bg-white p-8 text-center shadow-sm ring-1 ring-border">
            <BookOpen className="mx-auto h-10 w-10 text-primary/60" />
            <p className="mt-3 text-base font-bold text-primary-dark">
              暂无符合条件的题目
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              题库正在陆续录入中，试试清除筛选条件
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary-dark px-4 py-2 text-sm font-bold text-white"
            >
              清除筛选
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 text-xs font-bold text-muted-foreground">
              共 {data?.count ?? 0} 道题
            </div>
            <ul className="space-y-3">
              {filtered.map((q) => {
                const exp = parseExplanation(q.explanation);
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => setPreview(q)}
                      className="block w-full rounded bg-white p-4 text-left shadow-sm ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary-dark/30"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        {q.age_groups.slice(0, 2).map((ag) => (
                          <span
                            key={ag}
                            className="rounded-full bg-[#FCE6D6] px-2 py-0.5 text-[11px] font-bold text-[#B85F30]"
                          >
                            {ag}
                          </span>
                        ))}
                        {q.categories.slice(0, 2).map((cv) => {
                          const cdef = CATEGORY_DEFS.find((c) => c.value === cv);
                          return (
                            <span
                              key={cv}
                              className="rounded-full bg-[#EDF1DC] px-2 py-0.5 text-[11px] font-bold text-primary-dark"
                            >
                              {cdef?.label ?? cv}
                            </span>
                          );
                        })}
                        {q.category && q.categories.length === 0 && (
                          <span className="rounded-full bg-[#EDF1DC] px-2 py-0.5 text-[11px] font-bold text-primary-dark">
                            {q.category}
                          </span>
                        )}
                        {q.difficulty && (
                          <span className="rounded-full bg-[#EFEFD3] px-2 py-0.5 text-[11px] font-bold text-primary-dark">
                            {difficultyLabel(q.difficulty)}
                          </span>
                        )}
                        {q.question_type && (
                          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-muted-foreground ring-1 ring-border">
                            {questionTypeLabel(q.question_type)}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2.5 text-[15px] font-bold leading-relaxed text-[#222]">
                        {q.question}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-[12px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <FileText size={12} />
                          {q.options?.length ?? 0} 个选项
                        </span>
                        {q.sources && q.sources.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Tag size={12} />
                            {q.sources.length} 个来源
                          </span>
                        )}
                        {exp.doctor && (
                          <span className="inline-flex items-center gap-1 text-danger">
                            <CheckCircle2 size={12} />
                            含就医提示
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* 分页 */}
            {data && data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-dark ring-1 ring-border disabled:opacity-40"
                  aria-label="上一页"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-3 text-sm font-bold text-primary-dark">
                  {page} / {data.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-dark ring-1 ring-border disabled:opacity-40"
                  aria-label="下一页"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 详情预览弹层 */}
      {preview && (
        <PreviewModal q={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

function FilterRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-xs font-bold text-muted-foreground">
        {label}
      </span>
      <div className="-mx-1 flex flex-1 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={
              'shrink-0 rounded-md px-3 py-1.5 text-[13px] font-bold transition ' +
              (value === opt
                ? 'bg-primary-dark text-white'
                : 'bg-white text-muted-foreground ring-1 ring-border')
            }
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewModal({ q, onClose }: { q: Question; onClose: () => void }) {
  const exp = parseExplanation(q.explanation);
  const correct = q.options?.find((o) => o.is_correct);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 md:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[88dvh] w-full max-w-[480px] overflow-y-auto rounded-t-md bg-background p-5 shadow-2xl md:rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {q.age_groups.map((ag) => (
              <span
                key={ag}
                className="rounded-full bg-[#FCE6D6] px-2 py-0.5 text-[11px] font-bold text-[#B85F30]"
              >
                {ag}
              </span>
            ))}
            {q.categories.map((cv) => {
              const cdef = CATEGORY_DEFS.find((c) => c.value === cv);
              return (
                <span
                  key={cv}
                  className="rounded-full bg-[#EDF1DC] px-2 py-0.5 text-[11px] font-bold text-primary-dark"
                >
                  {cdef?.label ?? cv}
                </span>
              );
            })}
            {q.category && q.categories.length === 0 && (
              <span className="rounded-full bg-[#EDF1DC] px-2 py-0.5 text-[11px] font-bold text-primary-dark">
                {q.category}
              </span>
            )}
            {q.difficulty && (
              <span className="rounded-full bg-[#EFEFD3] px-2 py-0.5 text-[11px] font-bold text-primary-dark">
                {difficultyLabel(q.difficulty)}
              </span>
            )}
            {q.question_type && (
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-muted-foreground ring-1 ring-border">
                {questionTypeLabel(q.question_type)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-muted-foreground ring-1 ring-border"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-3 text-[17px] font-bold leading-relaxed text-[#222]">
          {q.question}
        </h2>

        {q.options && q.options.length > 0 && (
          <ul className="mt-4 space-y-2">
            {q.options.map((o) => {
              const isC = o.is_correct;
              return (
                <li
                  key={o.id}
                  className={
                    'flex items-start gap-2.5 rounded-md p-3 text-[14px] leading-relaxed ' +
                    (isC
                      ? 'bg-[#EDF7ED] text-[#2E5E3B] ring-1 ring-[#5A8F5E]/50'
                      : 'bg-white text-[#333] ring-1 ring-border')
                  }
                >
                  <span
                    className={
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ' +
                      (isC ? 'bg-[#5A8F5E] text-white' : 'bg-primary/30 text-primary-dark')
                    }
                  >
                    {isC ? <CheckCircle2 size={16} /> : o.option_label}
                  </span>
                  <span className="flex-1">{o.content}</span>
                </li>
              );
            })}
          </ul>
        )}

        {correct && (
          <div className="mt-4 rounded-md bg-primary-dark/10 p-3 text-[14px] text-primary-dark">
            <span className="font-extrabold">正确答案：</span>
            {correct.option_label}. {correct.content}
          </div>
        )}

        {exp.correct && (
          <section className="mt-3 rounded-md bg-white p-3 ring-1 ring-border">
            <h3 className="text-xs font-extrabold text-primary-dark">【正确做法】</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#333]">
              {exp.correct}
            </p>
          </section>
        )}
        {exp.distractor && (
          <section className="mt-3 rounded-md bg-white p-3 ring-1 ring-border">
            <h3 className="text-xs font-extrabold text-accent">【干扰项为什么错】</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#333]">
              {exp.distractor}
            </p>
          </section>
        )}
        {exp.doctor && (
          <section className="mt-3 rounded-md border-l-4 border-danger bg-[#FDE8E5]/60 p-3">
            <h3 className="text-xs font-extrabold text-danger">【何时需要看医生】</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#333]">
              {exp.doctor}
            </p>
          </section>
        )}

        {q.sources && q.sources.length > 0 && (
          <section className="mt-3 rounded-md bg-[#F6F6E8]/70 p-3 ring-1 ring-primary/30">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-dark">
              权威来源
            </h3>
            <ul className="mt-2 space-y-2">
              {q.sources.map((s) => {
                const m = q.source_maps?.find((x) => x.source_id === s.id);
                return (
                  <li key={s.id} className="text-[13px] leading-relaxed">
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
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex w-full items-center justify-center rounded-[28px] bg-primary-dark px-6 py-3 text-base font-bold text-white"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
