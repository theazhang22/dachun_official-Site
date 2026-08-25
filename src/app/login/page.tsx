'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, Phone } from 'lucide-react';
import { AuthShell, Field, inputCls } from '@/components/auth/auth-shell';
import { useAuth } from '@/components/auth/auth-provider';
import { PHONE_REGEX, PASSWORD_REGEX } from '@/lib/auth/types';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirect = params.get('redirect') || '/';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!PHONE_REGEX.test(phone)) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError('密码至少 6 位，且必须同时包含字母和数字');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          password,
          rememberMe: remember,
        }),
      });
      const json = (await res.json()) as {
        token?: string;
        user?: import('@/lib/auth/types').PublicUser;
        error?: string;
      };
      if (!res.ok || !json.token || !json.user) {
        setError(json.error || '登录失败');
        return;
      }
      signIn(json.token, json.user, remember);
      router.replace(redirect);
      router.refresh();
    } catch {
      setError('网络异常，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="手机号">
        <div className="relative">
          <Phone
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="请输入 11 位手机号"
            autoComplete="tel"
            className={inputCls + ' h-[52px] pl-11'}
          />
        </div>
      </Field>

      <Field label="密码">
        <div className="relative">
          <Lock
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
            className={inputCls + ' h-[52px] pl-11'}
          />
        </div>
      </Field>

      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[#333]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-primary-dark"
          />
          记住我（30 天免登录）
        </label>
        <Link
          href="/forgot-password"
          className="font-bold text-primary-dark hover:underline"
        >
          忘记密码？
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-[#FDE8E5] p-3 text-sm font-semibold text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[28px] bg-primary-dark px-6 text-base font-extrabold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            登录中…
          </>
        ) : (
          '登录'
        )}
      </button>
    </form>
  );
}

function LoginPageGuard() {
  const { isAuthed } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';

  // 已登录直接跳转
  useEffect(() => {
    if (isAuthed) router.replace(redirect);
  }, [isAuthed, redirect, router]);

  return <LoginInner />;
}

export default function LoginPage() {
  return (
    <AuthShell
      title="欢迎回来"
      subtitle="登录后继续你的育儿知识闯关"
      footer={
        <>
          没有账号？
          <Link
            href={`/register?redirect=${encodeURIComponent('/knowledge/yuer')}`}
            className="ml-1 font-bold text-primary-dark hover:underline"
          >
            立即注册
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="text-center text-muted-foreground">加载中…</div>}>
        <LoginPageGuard />
      </Suspense>
    </AuthShell>
  );
}
