'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function AuthShell({ title, subtitle, children, footer, maxWidth = 'max-w-[420px]' }: Props) {
  return (
    <main className="min-h-[100dvh] bg-background pt-[72px] md:pt-24">
      <div className="bg-gradient-to-b from-[#EFEFD3] via-background to-background pb-10 pt-8">
        <div className={`mx-auto w-full ${maxWidth} px-5`}>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary-dark"
          >
            <ArrowLeft size={18} />
            返回首页
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold leading-tight text-primary-dark">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}

          <div className="mt-7 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(51,51,51,0.06)] ring-1 ring-border md:p-7">
            {children}
          </div>

          {footer && (
            <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
          )}
        </div>
      </div>
    </main>
  );
}

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string | null;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-[#333]">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border-2 border-border bg-white px-4 text-[16px] text-[#333] outline-none transition focus:border-primary-dark placeholder:text-muted-foreground';
