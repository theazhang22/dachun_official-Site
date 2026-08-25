import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth/token';
import { PHONE_REGEX, PASSWORD_REGEX, type PublicUser } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

interface LoginBody {
  phone?: string;
  password?: string;
  rememberMe?: boolean;
}

interface FindUserRow {
  id: string;
  phone: string;
  password_hash: string;
  nickname: string;
  avatar_url: string | null;
  total_score: number;
  rank_title: string;
}

function toPublicUser(row: FindUserRow): PublicUser {
  return {
    id: row.id,
    phone: row.phone,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    total_score: row.total_score,
    rank_title: row.rank_title,
  };
}

export async function POST(req: NextRequest) {
  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: '请求格式不正确' }, { status: 400 });
  }

  const phone = (body.phone ?? '').trim();
  const password = body.password ?? '';
  const rememberMe = body.rememberMe === true;

  if (!PHONE_REGEX.test(phone)) {
    return NextResponse.json({ error: '请输入正确的 11 位手机号' }, { status: 400 });
  }
  if (!PASSWORD_REGEX.test(password)) {
    return NextResponse.json(
      { error: '密码至少 6 位，且必须同时包含字母和数字' },
      { status: 400 },
    );
  }

  const sb = getSupabase();
  const { data, error } = await sb.rpc('find_user_by_phone', { p_phone: phone });
  if (error) {
    return NextResponse.json({ error: `登录失败：${error.message}` }, { status: 500 });
  }
  const row = (Array.isArray(data) ? data[0] : data) as FindUserRow | undefined;

  // 统一返回"账号或密码错误"，不泄露手机号是否已注册
  if (!row) {
    return NextResponse.json({ error: '账号或密码错误' }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    return NextResponse.json({ error: '账号或密码错误' }, { status: 401 });
  }

  const token = signToken(row.id, { rememberMe });
  return NextResponse.json({ token, user: toPublicUser(row) });
}
