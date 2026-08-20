'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AuthShell, Field, inputCls } from '@/components/auth/auth-shell';
import { useAuth } from '@/components/auth/auth-provider';
import { PASSWORD_REGEX } from '@/lib/auth/types';

function ChangePasswordInner() {
  const router = useRouter();
  const { isAuthed, loading: authLoading, user } = useAuth();
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthed) {
      const redirect = encodeURIComponent('/change-password');
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [authLoading, isAuthed, router]);

  const pwdStrong = PASSWORD_REGEX.test(newPwd);
  const pwdMatch = newPwd === confirm && confirm.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!oldPwd) return setError('请输入原密码');
    if (!PASSWORD_REGEX.test(newPwd))
      return setError('新密码至少 6 位，且必须同时包含字母和数字');
    if (newPwd === oldPwd)
      return setError('新密码不能与原密码相同');
    if (!pwdMatch) return setError('两次输入的新密码不一致');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || '修改失败');
        return;
      }
      setSuccess(true);
      setOldPwd('');
      setNewPwd('');
      setConfirm('');
    } catch {
      setError('网络异常，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthed) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        正在验证登录状态…
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF7ED]">
          <CheckCircle2 className="h-9 w-9 text-[#5A8F5E]" />
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-primary-dark">密码修改成功</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          下次登录请使用新密码
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[28px] bg-primary-dark px-6 text-base font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {user && (
        <div className="rounded-lg bg-[#F6F6E8] px-4 py-2.5 text-xs text-muted-foreground">
          当前账号：
          <span className="font-bold text-primary-dark">
            {user.nickname || user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
          </span>
        </div>
      )}

      <Field label="原密码">
        <div className="relative">
          <Lock
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="password"
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
            placeholder="请输入当前密码"
            autoComplete="current-password"
            className={inputCls + ' h-[52px] pl-11'}
          />
        </div>
      </Field>

      <Field label="新密码" hint="6 位以上，必须同时包含字母和数字">
        <div className="relative">
          <Lock
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="请输入新密码"
            autoComplete="new-password"
            className={inputCls + ' h-[52px] pl-11'}
          />
        </div>
        {newPwd && (
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

      <Field label="确认新密码">
        <div className="relative">
          <Lock
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="再次输入新密码"
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
            提交中…
          </>
        ) : (
          '确认修改'
        )}
      </button>

      <Link
        href="/"
        className="flex items-center justify-center gap-1.5 py-2 text-sm font-bold text-muted-foreground hover:text-primary-dark"
      >
        <ArrowLeft size={14} />
        返回首页
      </Link>
    </form>
  );
}

export default function ChangePasswordPage() {
  return (
    <AuthShell
      title="修改密码"
      subtitle="建议定期更换密码，保障账号安全"
      footer={null}
    >
      <ChangePasswordInner />
    </AuthShell>
  );
}
