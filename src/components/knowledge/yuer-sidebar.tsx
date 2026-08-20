'use client';

import {
  BookOpen,
  Search,
  PenTool,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type YuerTab = 'intro' | 'browse' | 'quiz';
export type YuerTabKey = YuerTab;

interface SidebarProps {
  active: YuerTab;
  onSelect: (tab: YuerTab) => void;
}

const MENU: { key: YuerTab; icon: typeof BookOpen; label: string }[] = [
  { key: 'intro', icon: BookOpen, label: '知识库介绍' },
  { key: 'browse', icon: Search, label: '题库浏览' },
  { key: 'quiz', icon: PenTool, label: '开始答题' },
];

export function YuerSidebar({ active, onSelect }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handle = (k: YuerTab) => {
    onSelect(k);
    setMobileOpen(false);
  };

  return (
    <>
      {/* 移动端汉堡按钮 */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-[72px] z-30 inline-flex h-11 w-11 items-center justify-center bg-primary-dark text-white md:hidden"
        aria-label="打开目录"
      >
        <Menu size={22} />
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[270px] transform bg-gradient-to-b from-[#EFEFD3] to-background p-5 pt-[80px] shadow-xl transition-transform duration-300 md:sticky md:top-[80px] md:z-10 md:h-[calc(100dvh-80px)] md:w-[200px] md:shrink-0 md:translate-x-0 md:bg-none md:p-0 md:pt-0 md:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="育儿知识库目录"
      >
        <div className="flex items-center justify-between md:hidden">
          <span className="text-sm font-extrabold text-primary-dark">目录</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center bg-white text-muted-foreground ring-1 ring-border"
            aria-label="关闭目录"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 hidden md:block">
          <div className="text-lg font-extrabold text-primary-dark">目录</div>
        </div>

        <nav className="space-y-1">
          {MENU.map((m) => {
            const Icon = m.icon;
            const isActive = active === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => handle(m.key)}
                className={cn(
                  'group flex w-full items-center gap-3 border-l-[3px] px-3 py-3 text-left transition-all',
                  isActive
                    ? 'border-primary-dark bg-primary/15 text-primary-dark'
                    : 'border-transparent text-[#333] hover:bg-primary/10 hover:text-primary-dark',
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={2.2}
                  className={isActive ? 'text-primary-dark' : 'text-muted-foreground'}
                />
                <span className="text-[15px] font-extrabold leading-tight">
                  {m.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
