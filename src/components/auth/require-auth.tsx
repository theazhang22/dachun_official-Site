'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

/**
 * 包裹需要登录才能访问的页面（客户端守卫）
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthed, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthed) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [loading, isAuthed, pathname, router]);

  if (loading || !isAuthed) {
    return (
      <main className="flex min-h-[80dvh] w-full flex-col items-center justify-center bg-background pt-[72px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary-dark" />
        <p className="mt-4 text-base font-semibold text-primary-dark">
          {loading ? '正在验证登录状态…' : '未登录，正在跳转登录页…'}
        </p>
      </main>
    );
  }
  return <>{children}</>;
}
