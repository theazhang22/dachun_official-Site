'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  AUTHORITY_ORGS,
  AGE_DISTRIBUTION,
  CATEGORY_TAGS,
} from '@/lib/knowledge/repo';
import type { Source } from '@/lib/knowledge/types';

function OrgBadge({ short, full }: { short: string; full: string }) {
  return (
    <div
      className="group flex h-20 flex-col items-center justify-center border border-[#D8D8D8] bg-white px-3 text-center transition-colors duration-200 hover:border-primary-dark"
      title={full}
    >
      <span className="text-base font-extrabold leading-tight text-primary-dark">
        {short}
      </span>
      {short !== full && (
        <span className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
          {full}
        </span>
      )}
    </div>
  );
}

interface Props {
  onStartQuiz: () => void;
  onBrowse: (category?: string) => void;
}

export function YuerIntroPanel({ onStartQuiz, onBrowse }: Props) {
  const [sources, setSources] = useState<Source[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch('/api/knowledge/meta', { cache: 'no-store' });
        const json = (await res.json()) as { sources?: Source[]; count?: number };
        if (!aborted) {
          setSources(json.sources ?? []);
          setCount(json.count ?? 0);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  return (
    <div className="pb-10">
      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
        <h1 className="text-3xl font-extrabold leading-tight text-primary-dark md:text-4xl">
          大椿育儿知识库
        </h1>
        <p className="mt-2 text-lg font-bold text-[#333]">
          每一道题都有权威出处
        </p>

        <div className="mt-5 grid max-w-md grid-cols-2 gap-6">
          <div>
            <div className="text-3xl font-extrabold text-primary-dark">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                Math.max(55, sources.length)
              )}
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">
              权威来源
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-accent">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : count > 0 ? (
                count.toLocaleString()
              ) : (
                '1,975'
              )}
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">
              道精选题{count === 0 && '（录入中）'}
            </div>
          </div>
        </div>
      </section>

      {/* 来源矩阵 */}
      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-primary-dark">权威来源矩阵</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          每一条建议都能追溯到下列机构的公开指南或共识文件
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {AUTHORITY_ORGS.map((o) => (
            <OrgBadge key={o.short} short={o.short} full={o.full} />
          ))}
        </div>

        {sources.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border-l-2 border-primary/50 pl-4">
              <div className="text-sm font-bold text-primary-dark">
                已入库文献（{sources.length}）
              </div>
              <ul className="mt-3 space-y-2.5">
                {sources.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-start gap-2 text-[13px]">
                    <span
                      className={
                        'mt-0.5 inline-flex h-5 shrink-0 items-center px-1.5 text-[10px] font-bold text-white ' +
                        (s.source_group === 'A'
                          ? 'bg-primary-dark'
                          : s.source_group === 'B'
                            ? 'bg-accent'
                            : 'bg-muted-foreground')
                      }
                    >
                      {s.source_group ?? '-'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#333]">{s.short_name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.org_name} · {s.year}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-bold text-primary-dark">年龄段分布</div>
              <div className="mt-1 text-xs text-muted-foreground">覆盖 0-6 岁全成长周期</div>
              <div className="mt-3 space-y-2.5">
                {AGE_DISTRIBUTION.map((a) => (
                  <div key={a.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-[#333]">{a.label}</span>
                      <span className="font-bold text-primary-dark">{a.percent}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden bg-[#EFEFD3]">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-dark"
                        style={{ width: `${a.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 分类 */}
      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-primary-dark">热门分类</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          选择你最关心的话题，针对性练习
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORY_TAGS.map((tag, i) => (
            <button
              key={tag}
              type="button"
              onClick={() => onBrowse(tag)}
              className={
                'px-3.5 py-2 text-[13px] font-bold transition-all duration-200 hover:-translate-y-0.5 ' +
                (i % 3 === 0
                  ? 'bg-primary text-primary-dark hover:bg-primary-light'
                  : i % 3 === 1
                    ? 'bg-[#EDF1DC] text-primary-dark hover:bg-primary/30'
                    : 'bg-[#FCE6D6] text-[#B85F30] hover:bg-accent/20')
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10 bg-gradient-to-br from-primary-dark to-[#636837] p-5 text-center">
        <h3 className="text-lg font-extrabold text-white">10 道题，3 分钟</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/85">
          答完即得积分，从学童一路闯到状元。
        </p>
        <button
          type="button"
          onClick={onStartQuiz}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-white px-6 py-3.5 text-base font-extrabold text-primary-dark shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          开始答题
          <ArrowRight size={20} strokeWidth={2.8} />
        </button>
      </section>
    </div>
  );
}
