import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabase } from '@/lib/supabase';
import { verifyCode } from '@/lib/auth/codes';
import { PHONE_REGEX, PASSWORD_REGEX } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

interface ResetBody {
  phone?: string;
  code?: string;
  newPassword?: string;
}

interface FindUserRow {
  id: string;
}

export async function POST(req: NextRequest) {
  let body: ResetBody;
  try {
    body = (await req.json()) as ResetBody;
  } catch {
    return NextResponse.json({ error: '请求格式不正确' }, { status: 400 });
  }

  const phone = (body.phone ?? '').trim();
  const code = (body.code ?? '').trim();
  const newPassword = body.newPassword ?? '';

  if (!PHONE_REGEX.test(phone)) {
    return NextResponse.json({ error: '请输入正确的 11 位手机号' }, { status: 400 });
  }
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: '请输入 6 位验证码' }, { status: 400 });
  }
  if (!PASSWORD_REGEX.test(newPassword)) {
    return NextResponse.json(
      { error: '新密码至少 6 位，且必须同时包含字母和数字' },
      { status: 400 },
    );
  }

  const check = verifyCode(phone, code);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason || '验证码错误' }, { status: 400 });
  }

  const sb = getSupabase();
  const { data, error } = await sb.rpc('find_user_by_phone', { p_phone: phone });
  if (error) {
    return NextResponse.json({ error: `重置失败：${error.message}` }, { status: 500 });
  }
  const row = (Array.isArray(data) ? data[0] : data) as FindUserRow | undefined;
  if (!row) {
    return NextResponse.json({ error: '该手机号尚未注册' }, { status: 404 });
  }

  const password_hash = await bcrypt.hash(newPassword, 10);
  const { error: updErr } = await sb.rpc('update_user_password', {
    p_user_id: row.id,
    p_password_hash: password_hash,
  });
  if (updErr) {
    return NextResponse.json(
      { error: `重置失败：${updErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, message: '密码重置成功' });
}
