'use client';

import { useEffect, useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: '首页', href: '#home' },
  { label: '知识库', href: '#knowledge' },
  { label: '社区活动', href: '#activities' },
  { label: '适老服务', href: '#services' },
  { label: '关于我们', href: '#about' },
];

const HOTLINE = '18664353853';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);

      // 滚动到哪个 section，就高亮对应导航项
      const offset = 90; // 导航栏高度 + 余量
      const sections = NAV_ITEMS.map((i) => document.querySelector(i.href)).filter(
        (el): el is HTMLElement => el instanceof HTMLElement,
      );

      // 从底部往上找：第一个顶部已进入视口上沿的 section 即为当前
      let current = 'home';
      for (let i = sections.length - 1; i >= 0; i--) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top <= offset) {
          current = sections[i].id;
          break;
        }
      }
      // 页面滚动到最底部时强制高亮最后一个 section
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = sections[sections.length - 1]?.id ?? current;
      }
      setActiveId(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-300',
        scrolled
          ? 'shadow-[0_2px_20px_rgba(51,51,51,0.10)]'
          : 'shadow-[0_1px_0_rgba(216,216,216,0.6)]',
      )}
    >
      <div className="container-page flex h-[64px] lg:h-[88px] items-center justify-between gap-3 lg:gap-4">
        <Link href="#home" aria-label="大椿助老首页" className="flex shrink-0 items-center">
          <Logo height={60} className="h-12 lg:h-[72px]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const id = item.href.slice(1);
            const active = activeId === id;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative rounded-lg px-4 py-2.5 text-[17px] font-medium transition-colors',
                  active
                    ? 'text-primary-dark'
                    : 'text-[#333333] hover:text-primary-dark',
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute inset-x-4 -bottom-0.5 h-[3px] rounded-full bg-primary transition-transform duration-200',
                    active ? 'scale-x-100' : 'origin-left scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="#contact" className="btn-dark hidden sm:inline-flex">
            立即咨询
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F6E8] text-primary-dark lg:hidden"
            aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 top-[64px] lg:top-[88px] z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="container-page absolute inset-x-0 top-[64px] lg:top-[88px] z-50 max-h-[calc(100vh-64px lg:100vh-88px)] overflow-y-auto border-t border-border bg-white pb-8 pt-4 shadow-xl"
            aria-label="移动端导航"
          >
            {NAV_ITEMS.map((item) => {
              const id = item.href.slice(1);
              const active = activeId === id;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block border-b border-border/60 px-2 py-4 text-lg font-semibold',
                    active ? 'text-primary-dark' : 'text-[#333]',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="btn-dark w-full"
              >
                立即咨询
              </Link>
              <a
                href={`tel:${HOTLINE}`}
                className="btn-accent w-full"
              >
                <Phone size={20} strokeWidth={2.6} />
                拨打助老热线 {HOTLINE}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
