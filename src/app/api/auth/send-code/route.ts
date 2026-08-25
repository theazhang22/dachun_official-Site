import { NextRequest, NextResponse } from 'next/server';
import { canSendCode, issueCode, DEV_FIXED_CODE } from '@/lib/auth/codes';
import { PHONE_REGEX } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { phone?: string };
  try {
    body = (await req.json()) as { phone?: string };
  } catch {
    return NextResponse.json({ error: '请求格式不正确' }, { status: 400 });
  }

  const phone = (body.phone ?? '').trim();
  if (!PHONE_REGEX.test(phone)) {
    return NextResponse.json({ error: '请输入正确的 11 位手机号' }, { status: 400 });
  }

  const check = canSendCode(phone);
  if (!check.ok) {
    return NextResponse.json(
      { error: `请在 ${check.retryAfter} 秒后再尝试` },
      { status: 429 },
    );
  }

  const code = issueCode(phone);

  // TODO: 接入短信服务商后，删除 devCode 字段，仅返回发送成功状态
  return NextResponse.json({
    ok: true,
    message: '验证码已发送（开发环境固定 123456）',
    ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : { devCode: DEV_FIXED_CODE }),
  });
}
