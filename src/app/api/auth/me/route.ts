import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth/token';
import type { PublicUser } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

interface FindUserRow {
  id: string;
  phone: string;
  nickname: string;
  avatar_url: string | null;
  total_score: number;
  rank_title: string;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from('dachun_users')
    .select('id, phone, nickname, avatar_url, total_score, rank_title')
    .eq('id', payload.uid)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }
  const row = data as FindUserRow;
  const user: PublicUser = {
    id: row.id,
    phone: row.phone,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    total_score: row.total_score,
    rank_title: row.rank_title,
  };
  return NextResponse.json({ user });
}
