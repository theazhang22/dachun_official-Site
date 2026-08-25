import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth/token';
import { PHONE_REGEX, PASSWORD_REGEX, type PublicUser } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

interface RegisterBody {
  phone?: string;
  password?: string;
  nickname?: string;
}

interface CreateUserRow {
  id: string;
  phone: string;
  password_hash: string;
  nickname: string;
  avatar_url: string | null;
  total_score: number;
  rank_title: string;
  created_at: string;
}

export async function POST(req: NextRequest) {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: '请求格式不正确' }, { status: 400 });
  }

  const phone = (body.phone ?? '').trim();
  const password = body.password ?? '';
  const nickname = (body.nickname ?? '').trim();

  if (!PHONE_REGEX.test(phone)) {
    return NextResponse.json({ error: '请输入正确的 11 位手机号' }, { status: 400 });
  }
  if (!PASSWORD_REGEX.test(password)) {
    return NextResponse.json(
      { error: '密码至少 6 位，且必须同时包含字母和数字' },
      { status: 400 },
    );
  }
  if (nickname.length < 1 || nickname.length > 20) {
    return NextResponse.json({ error: '请输入 1-20 字昵称' }, { status: 400 });
  }

  const sb = getSupabase();
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await sb.rpc('create_user', {
    p_phone: phone,
    p_password_hash: password_hash,
    p_nickname: nickname,
  });

  if (error) {
    if (String(error.code) === '23505' || /duplicate/i.test(error.message)) {
      return NextResponse.json({ error: '该手机号已注册，请直接登录' }, { status: 409 });
    }
    return NextResponse.json(
      { error: `注册失败：${error.message}` },
      { status: 500 },
    );
  }

  const row = (Array.isArray(data) ? data[0] : data) as CreateUserRow | undefined;
  if (!row || !row.id) {
    return NextResponse.json({ error: '注册失败：用户数据未返回' }, { status: 500 });
  }

  const user: PublicUser = {
    id: row.id,
    phone: row.phone,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    total_score: row.total_score,
    rank_title: row.rank_title,
  };
  const token = signToken(user.id);
  return NextResponse.json({ token, user });
}
