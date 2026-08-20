'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  phone: string;
  disabled?: boolean;
  onSent?: () => void;
}

const STORAGE_KEY = 'dachun-sms-countdown';

export function SendCodeButton({ phone, disabled, onSent }: Props) {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 页面刷新后保留倒计时
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const until = Number(saved);
      const remain = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      if (remain > 0) setCooldown(remain);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setCooldown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => {
      if (timerRef.current && cooldown <= 1) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cooldown]);

  const send = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = (await res.json()) as { error?: string; retryAfter?: number };
      if (!res.ok) {
        setError(json.error || '发送失败');
        if (json.retryAfter) setCooldown(json.retryAfter);
        return;
      }
      const until = Date.now() + 60 * 1000;
      window.localStorage.setItem(STORAGE_KEY, String(until));
      setCooldown(60);
      onSent?.();
    } catch {
      setError('网络异常，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const inCooldown = cooldown > 0;
  const isDisabled = disabled || loading || inCooldown;

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={send}
        disabled={isDisabled}
        className={
          'shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ' +
          (isDisabled
            ? 'cursor-not-allowed bg-muted text-muted-foreground'
            : 'bg-primary-dark text-white hover:brightness-95 active:scale-[0.98]')
        }
        style={{ minHeight: 44 }}
      >
        {loading ? (
          <span className="inline-flex items-center gap-1">
            <Loader2 size={14} className="animate-spin" /> 发送中
          </span>
        ) : inCooldown ? (
          `${cooldown}s 后重发`
        ) : (
          '获取验证码'
        )}
      </button>
      {error && <span className="mt-1 text-xs text-danger">{error}</span>}
    </div>
  );
}
