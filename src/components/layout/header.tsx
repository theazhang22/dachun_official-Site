'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Phone, User, LogOut, Award, ChevronDown, Sparkles, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';

interface SubNavItem {
  label: string;
  href: string;
  badge?: string;
}
interface NavItem {
  label: string;
  href: string;
  children?: SubNavItem[];
}

// 知识库板块下的二级菜单
const KNOWLEDGE_CHILDREN: SubNavItem[] = [
  { label: '育儿知识库', href: '/knowledge/yuer', badge: 'NEW' },
  { label: '银发健康', href: '/#knowledge' },
  { label: '饮食营养', href: '/#knowledge' },
  { label: '防骗安全', href: '/#knowledge' },
];

const NAV_ITEMS: NavItem[] = [
  { label: '首页', href: '/#home' },
  { label: '知识库', href: '/#knowledge', children: KNOWLEDGE_CHILDREN },
  { label: '社区活动', href: '/#activities' },
  { label: '适老服务', href: '/#services' },
  { label: '关于我们', href: '/#about' },
];

const HOTLINE = '18664353853';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileKbOpen, setMobileKbOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('home');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [kbMenuOpen, setKbMenuOpen] = useState(false);
  const kbMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const kbCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const isKnowledgeArea = pathname?.startsWith('/knowledge');

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!kbMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (kbMenuRef.current && !kbMenuRef.current.contains(e.target as Node)) {
        setKbMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [kbMenuOpen]);

  const openKbMenu = () => {
    if (kbCloseTimer.current) clearTimeout(kbCloseTimer.current);
    setKbMenuOpen(true);
  };
  const scheduleCloseKbMenu = () => {
    if (kbCloseTimer.current) clearTimeout(kbCloseTimer.current);
    kbCloseTimer.current = setTimeout(() => setKbMenuOpen(false), 150);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    signOut();
    router.push('/');
  };

  useEffect(() => {
    if (isKnowledgeArea) {
      // 知识库子页：清掉 scroll spy 的当前项，避免"首页"残留下划线
      setActiveId('');
      setScrolled(window.scrollY > 8);
      return;
    }
    const onScroll = () => {
      setScrolled(window.scrollY > 8);

      // 滚动到哪个 section，就高亮对应导航项
      const sections = NAV_ITEMS
        .map((i) => document.querySelector(i.href.replace(/^\//, '')))
        .filter((el): el is HTMLElement => el instanceof HTMLElement);

      // 从底部往上找：第一个顶部已进入视口上沿的 section 即为当前
      let current = 'home';
      for (let i = sections.length - 1; i >= 0; i--) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top <= 90) {
          current = sections[i].id;
          break;
        }
      }
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
  }, [isKnowledgeArea]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isItemActive = (item: NavItem) => {
    if (item.children) {
      if (pathname?.startsWith('/knowledge/yuer')) return true;
      return activeId === item.href.split('#')[1];
    }
    return activeId === item.href.split('#')[1];
  };

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
        <Link href="/" aria-label="大椿助老首页" className="flex shrink-0 items-center">
          <Logo height={60} className="h-12 lg:h-[72px]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            if (item.children) {
              return (
                <div
                  key={item.href}
                  ref={kbMenuRef}
                  className="relative"
                  onMouseEnter={openKbMenu}
                  onMouseLeave={scheduleCloseKbMenu}
                >
                  <button
                    type="button"
                    onClick={() => setKbMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={kbMenuOpen}
                    className={cn(
                      'group inline-flex items-center gap-1 rounded-lg px-3 py-2.5 text-[16px] font-medium transition-colors',
                      active
                        ? 'text-primary-dark'
                        : 'text-[#333333] hover:text-primary-dark',
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      size={16}
                      className={cn('transition-transform duration-200', kbMenuOpen && 'rotate-180')}
                    />
                    <span
                      className={cn(
                        'absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-primary transition-transform duration-200',
                        active ? 'scale-x-100' : 'origin-left scale-x-0 group-hover:scale-x-100',
                      )}
                    />
                  </button>
                  {kbMenuOpen && (
                    <div
                      role="menu"
                      className="absolute left-1/2 top-[calc(100%+6px)] w-60 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-white py-2 shadow-[0_12px_32px_rgba(61,51,40,0.14)]"
                    >
                      <div className="px-4 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        选择知识库
                      </div>
                      {item.children.map((child) => {
                        const childActive =
                          child.href.startsWith('/') &&
                          !child.href.startsWith('/#') &&
                          (pathname === child.href || pathname?.startsWith(child.href + '/'));
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            role="menuitem"
                            onClick={() => setKbMenuOpen(false)}
                            className={cn(
                              'flex items-center justify-between gap-2 px-4 py-2.5 text-[15px] font-semibold transition-colors',
                              childActive
                                ? 'bg-[#F6F6E8] text-primary-dark'
                                : 'text-[#333] hover:bg-[#F6F6E8]/60 hover:text-primary-dark',
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {child.label}
                              {child.badge === 'NEW' && (
                                <Sparkles size={15} className="text-accent" />
                              )}
                            </span>
                            {child.badge && (
                              <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative rounded-lg px-3 py-2.5 text-[16px] font-medium transition-colors',
                  active
                    ? 'text-primary-dark'
                    : 'text-[#333333] hover:text-primary-dark',
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-primary transition-transform duration-200',
                    active ? 'scale-x-100' : 'origin-left scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          {!loading && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[#F6F6E8] pl-1.5 pr-3 text-primary-dark lg:h-12"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark text-white">
                  <User size={16} />
                </span>
                <span className="hidden max-w-[110px] truncate text-sm font-bold sm:inline">
                  {user.nickname || user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                </span>
                <ChevronDown size={16} className={cn('transition', userMenuOpen && 'rotate-180')} />
              </button>
              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[52px] w-56 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-border"
                >
                  <div className="border-b border-border/60 px-4 py-3">
                    <div className="truncate text-sm font-bold text-[#222]">
                      {user.nickname || '未命名用户'}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Award size={12} />
                      {user.rank_title} · {user.total_score} 积分
                    </div>
                  </div>
                  <Link
                    href="/knowledge/yuer?tab=quiz"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#333] hover:bg-[#F6F6E8]"
                  >
                    <Award size={16} /> 我的答题
                  </Link>
                  <Link
                    href="/change-password"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#333] hover:bg-[#F6F6E8]"
                  >
                    <KeyRound size={16} /> 修改密码
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-2 border-t border-border/60 px-4 py-3 text-left text-sm font-semibold text-danger hover:bg-[#FDE8E5]"
                  >
                    <LogOut size={16} /> 退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-full border-2 border-primary-dark px-4 text-sm font-bold text-primary-dark hover:bg-primary-dark hover:text-white lg:h-12"
            >
              登录/注册
            </Link>
          )}
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
            className="fixed inset-0 top-[64px] z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="container-page absolute inset-x-0 top-[64px] z-50 max-h-[calc(100vh-64px)] overflow-y-auto border-t border-border bg-white pb-8 pt-2 shadow-xl"
            aria-label="移动端导航"
          >
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              if (!item.children) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center justify-between border-b border-border/60 px-2 py-4 text-lg font-semibold',
                      active ? 'text-primary-dark' : 'text-[#333]',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div key={item.href} className="border-b border-border/60">
                  <button
                    type="button"
                    onClick={() => setMobileKbOpen((v) => !v)}
                    aria-expanded={mobileKbOpen}
                    className={cn(
                      'flex w-full items-center justify-between px-2 py-4 text-left text-lg font-semibold',
                      active ? 'text-primary-dark' : 'text-[#333]',
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={22}
                      className={cn('transition-transform', mobileKbOpen && 'rotate-180')}
                    />
                  </button>
                  {mobileKbOpen && (
                    <div className="pb-2 pl-2">
                      {item.children.map((child) => {
                        const childActive =
                          child.href.startsWith('/') &&
                          !child.href.startsWith('/#') &&
                          (pathname === child.href || pathname?.startsWith(child.href + '/'));
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => {
                              setMobileKbOpen(false);
                              setMobileOpen(false);
                            }}
                            className={cn(
                              'flex items-center justify-between gap-2 rounded-lg px-3 py-3 text-base font-semibold',
                              childActive
                                ? 'bg-[#F6F6E8] text-primary-dark'
                                : 'text-[#444] hover:bg-[#F6F6E8]/60',
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {child.label}
                              {child.badge === 'NEW' && (
                                <Sparkles size={16} className="text-accent" />
                              )}
                            </span>
                            {child.badge && (
                              <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mt-6 flex flex-col gap-3">
              {!loading && user ? (
                <div className="rounded-2xl bg-[#F6F6E8] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-dark text-white">
                      <User size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-base font-bold text-[#222]">
                        {user.nickname || '未命名用户'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.rank_title} · {user.total_score} 积分
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-danger py-2.5 text-sm font-bold text-danger"
                  >
                    <LogOut size={16} /> 退出登录
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full border-2 border-primary-dark py-3 text-base font-bold text-primary-dark"
                >
                  登录 / 注册
                </Link>
              )}
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
