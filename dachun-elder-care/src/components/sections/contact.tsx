'use client';

import { useState, type FormEvent } from 'react';
import { Phone, Send, CheckCircle2, Headphones, Loader2, AlertCircle } from 'lucide-react';

const HOTLINE = '18664353853';
const SERVICE_EMAIL = 'dachun_service@163.com';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function Contact() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    community: '',
    need: '',
  });

  const resetForm = () => {
    setForm({ name: '', phone: '', community: '', need: '' });
    setErrorMsg('');
    setSubmitState('idle');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitState === 'loading') return;

    setSubmitState('loading');
    setErrorMsg('');

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await resp.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!resp.ok || !data.ok) {
        throw new Error(data.error || '提交失败，请稍后再试');
      }
      setSubmitState('success');
    } catch (err) {
      setSubmitState('error');
      setErrorMsg(err instanceof Error ? err.message : '网络异常，请稍后再试');
    }
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-primary-dark py-20 text-white md:py-28"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary/20" />

      <div className="container-page relative grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        {/* 左侧：联系信息 */}
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white/70">
            <span className="h-px w-8 bg-white/60" />
            CONTACT US
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            联系方式
          </h2>
          <p className="mt-5 max-w-md text-lg text-white/80">
            有任何疑问，欢迎电话或邮件联系我们。我们会认真倾听您的需求，再给出实在的建议。
          </p>

          <div className="mt-10 space-y-5">
            <ContactItem
              icon={<Phone size={24} strokeWidth={2.4} />}
              label="联系电话"
              value={HOTLINE}
              href={`tel:${HOTLINE}`}
              big
            />
            <ContactItem
              icon={<Headphones size={24} strokeWidth={2.2} />}
              label="咨询邮箱"
              value={SERVICE_EMAIL}
              href={`mailto:${SERVICE_EMAIL}`}
            />
          </div>
        </div>

        {/* 右侧：表单 */}
        <div className="rounded-2xl bg-white p-8 text-[#333333] shadow-2xl md:p-10">
          {submitState === 'success' ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-dark">
                <CheckCircle2 size={48} strokeWidth={2.2} />
              </span>
              <h3 className="mt-6 text-2xl font-bold text-primary-dark">
                信息已收到
              </h3>
              <p className="mt-3 max-w-sm text-base text-[#666666]">
                我们的顾问将尽快与您联系。紧急情况请直接拨打{' '}
                <a href={`tel:${HOTLINE}`} className="font-bold text-[#7A8045] underline">
                  {HOTLINE}
                </a>
                。
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-8 text-base font-bold text-primary-dark underline-offset-4 hover:underline"
              >
                再提交一条
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-primary-dark">
                留下您的联系方式
              </h3>
              <p className="mt-2 text-base text-[#666666]">
                填写以下信息，我们将主动与您联系。所有信息仅用于本次咨询。
              </p>
              <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
                <Field label="您的称呼" required>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例如：张先生"
                    className="input-base"
                    disabled={submitState === 'loading'}
                  />
                </Field>
                <Field label="联系电话" required>
                  <input
                    type="tel"
                    required
                    pattern="[0-9\-+ ]{7,20}"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="方便接听的手机号或座机"
                    className="input-base"
                    disabled={submitState === 'loading'}
                  />
                </Field>
                <Field label="长辈所在社区/小区">
                  <input
                    type="text"
                    value={form.community}
                    onChange={(e) =>
                      setForm({ ...form, community: e.target.value })
                    }
                    placeholder="例如：京基御景峯4栋"
                    className="input-base"
                    disabled={submitState === 'loading'}
                  />
                </Field>
                <Field label="希望了解的服务">
                  <textarea
                    rows={3}
                    value={form.need}
                    onChange={(e) => setForm({ ...form, need: e.target.value })}
                    placeholder="简单描述长辈的情况"
                    className="input-base resize-none"
                    disabled={submitState === 'loading'}
                  />
                </Field>

                {submitState === 'error' && errorMsg && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-[#F2C9C2] bg-[#FBEDEA] p-3 text-sm font-medium text-[#B0463A]"
                  >
                    <AlertCircle size={18} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={submitState === 'loading'}
                >
                  {submitState === 'loading' ? (
                    <>
                      <Loader2 size={18} strokeWidth={2.4} className="animate-spin" />
                      提交中…
                    </>
                  ) : (
                    <>
                      <Send size={18} strokeWidth={2.4} />
                      提交预约
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-[#999999]">
                  提交即视为同意我们的隐私政策，我们不会将信息泄露给第三方。
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.input-base) {
          width: 100%;
          border-radius: 0.75rem;
          border: 2px solid #d8d8d8;
          background: #f6f6e8;
          padding: 0.85rem 1rem;
          font-size: 1rem;
          color: #333;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        :global(.input-base::placeholder) {
          color: #999;
        }
        :global(.input-base:focus) {
          border-color: #7a8045;
          box-shadow: 0 0 0 3px rgba(122, 128, 69, 0.18);
        }
        :global(.input-base:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, required, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#333333]">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  big?: boolean;
}

function ContactItem({ icon, label, value, href, big }: ContactItemProps) {
  const content = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-primary sm:h-14 sm:w-14">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-white/70">{label}</span>
        <span
          className={
            big
              ? 'block truncate text-2xl font-bold tracking-wide sm:text-3xl'
              : 'block truncate text-lg font-semibold sm:text-xl'
          }
        >
          {value}
        </span>
      </span>
    </>
  );

  return href ? (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-xl p-1 transition hover:bg-white/5"
    >
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-4 p-1">{content}</div>
  );
}
