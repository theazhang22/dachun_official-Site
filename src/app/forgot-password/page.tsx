'use client';

import Link from 'next/link';
import { Phone, Headphones, ArrowLeft, Mail, MapPin } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';

const HOTLINE = '18664353853';
const EMAIL = 'care@dachun-elder.com';
const ADDRESS = '北京市朝阳区幸福里社区服务中心 3 层';

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="找回密码" subtitle="请通过客服协助重置你的登录密码">
      <div className="space-y-5">
        <div className="rounded-xl bg-[#F6F6E8] p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-dark/15">
            <Headphones size={28} className="text-primary-dark" />
          </div>
          <h3 className="mt-3 text-lg font-extrabold text-primary-dark">
            联系客服重置密码
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            为保障你的账号安全，请拨打客服热线或发送邮件，
            <br />
            我们会核实身份后帮你重置密码。
          </p>
        </div>

        <a
          href={`tel:${HOTLINE}`}
          className="flex items-center gap-4 rounded-xl border-2 border-primary-dark bg-white p-4 transition hover:-translate-y-0.5 hover:bg-[#F6F6E8]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-dark text-white">
            <Phone size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold text-muted-foreground">
              客服热线（工作日 9:00–18:00）
            </span>
            <span className="block text-lg font-extrabold tracking-wider text-primary-dark">
              {HOTLINE.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')}
            </span>
          </span>
        </a>

        <a
          href={`mailto:${EMAIL}`}
          className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition hover:border-primary-dark/50 hover:bg-[#F6F6E8]/60"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Mail size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold text-muted-foreground">
              邮箱（24 小时内回复）
            </span>
            <span className="block truncate text-sm font-bold text-[#333]">
              {EMAIL}
            </span>
          </span>
        </a>

        <div className="flex items-start gap-4 rounded-xl bg-muted/50 p-4">
          <MapPin size={20} className="mt-0.5 shrink-0 text-muted-foreground" />
          <div className="text-sm leading-relaxed text-muted-foreground">
            {ADDRESS}
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-[28px] bg-primary-dark px-6 py-3.5 text-base font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
        >
          <ArrowLeft size={18} />
          返回登录
        </Link>
      </div>
    </AuthShell>
  );
}
