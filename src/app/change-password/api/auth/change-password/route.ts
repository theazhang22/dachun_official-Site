import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth/token';
import { PASSWORD_REGEX } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

interface FindUserRow {
  id: string;
  password_hash: string;
}

interface ChangePasswordBody {
  oldPassword?: string;
  newPassword?: string;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
  }

  let body: ChangePasswordBody;
  try {
    body = (await req.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json({ error: '请求格式不正确' }, { status: 400 });
  }

  const oldPassword = body.oldPassword ?? '';
  const newPassword = body.newPassword ?? '';

  if (!oldPassword) {
    return NextResponse.json({ error: '请输入原密码' }, { status: 400 });
  }
  if (!PASSWORD_REGEX.test(newPassword)) {
    return NextResponse.json(
      { error: '新密码至少 6 位，且必须同时包含字母和数字' },
      { status: 400 },
    );
  }
  if (oldPassword === newPassword) {
    return NextResponse.json({ error: '新密码不能与原密码相同' }, { status: 400 });
  }

  const sb = getSupabase();

  // 取出当前用户的 password_hash
  const { data: rows, error: findErr } = await sb
    .from('dachun_users')
    .select('id, password_hash')
    .eq('id', payload.uid)
    .maybeSingle();

  if (findErr) {
    return NextResponse.json(
      { error: `查询失败：${findErr.message}` },
      { status: 500 },
    );
  }
  const row = rows as FindUserRow | null;
  if (!row) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  // 校验原密码
  const oldOk = await bcrypt.compare(oldPassword, row.password_hash);
  if (!oldOk) {
    return NextResponse.json({ error: '原密码不正确' }, { status: 401 });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  const { error: updateErr } = await sb.rpc('update_user_password', {
    p_user_id: payload.uid,
    p_password_hash: newHash,
  });

  if (updateErr) {
    return NextResponse.json(
      { error: `修改失败：${updateErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
