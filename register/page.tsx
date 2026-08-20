'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, Phone, User } from 'lucide-react';
import { AuthShell, Field, inputCls } from '@/components/auth/auth-shell';
import { useAuth } from '@/components/auth/auth-provider';
import { PHONE_REGEX, PASSWORD_REGEX } from '@/lib/auth/types';

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();
  const redirect = params.get('redirect') || '/knowledge/yuer';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwdStrong = PASSWORD_REGEX.test(password);
  const pwdMatch = password === confirm && confirm.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!PHONE_REGEX.test(phone)) return setError('请输入正确的 11 位手机号');
    if (!PASSWORD_REGEX.test(password))
      return setError('密码至少 6 位，且必须同时包含字母和数字');
    if (!pwdMatch) return setError('两次输入的密码不一致');
    if (nickname.trim().length < 1) return setError('请输入昵称');
    if (!agreed) return setError('请先阅读并同意服务条款与隐私政策');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          password,
          nickname: nickname.trim(),
        }),
      });
      const json = (await res.json()) as {
        token?: string;
        user?: import('@/lib/auth/types').PublicUser;
        error?: string;
      };
      if (!res.ok || !json.token || !json.user) {
        setError(json.error || '注册失败');
        return;
      }
      signIn(json.token, json.user, true);
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
      <Field label="昵称">
        <div className="relative">
          <User
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={nickname}
            maxLength={20}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="给自己起个昵称"
            className={inputCls + ' h-[52px] pl-11'}
          />
        </div>
      </Field>

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
            placeholder="6 位以上，字母+数字"
            autoComplete="new-password"
            className={inputCls + ' h-[52px] pl-11'}
          />
        </div>
        {password && (
          <span
            className={
              'mt-1 inline-flex items-center gap-1 text-xs font-semibold ' +
              (pwdStrong ? 'text-primary-dark' : 'text-accent')
            }
          >
            {pwdStrong ? '✓ 密码强度合格' : '密码至少 6 位，且必须包含字母和数字'}
          </span>
        )}
      </Field>

      <Field label="确认密码">
        <div className="relative">
          <Lock
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="再次输入密码"
            autoComplete="new-password"
            className={inputCls + ' h-[52px] pl-11'}
          />
        </div>
        {confirm && (
          <span
            className={
              'mt-1 inline-flex items-center gap-1 text-xs font-semibold ' +
              (pwdMatch ? 'text-primary-dark' : 'text-danger')
            }
          >
            {pwdMatch ? '✓ 两次密码一致' : '两次输入不一致'}
          </span>
        )}
      </Field>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-[#333]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-primary-dark"
        />
        <span>
          我已阅读并同意
          <Link href="/terms" className="mx-0.5 font-bold text-primary-dark hover:underline">
            《服务条款》
          </Link>
          与
          <Link href="/privacy" className="mx-0.5 font-bold text-primary-dark hover:underline">
            《隐私政策》
          </Link>
        </span>
      </label>

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
            注册中…
          </>
        ) : (
          '注册并登录'
        )}
      </button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="创建账号"
      subtitle="注册后即可保存答题积分，从学童闯到状元"
      footer={
        <>
          已有账号？
          <Link href="/login" className="ml-1 font-bold text-primary-dark hover:underline">
            去登录
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="text-center text-muted-foreground">加载中…</div>}>
        <RegisterInner />
      </Suspense>
    </AuthShell>
  );
}
