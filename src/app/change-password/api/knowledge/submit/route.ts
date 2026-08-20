import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth/token';

export const dynamic = 'force-dynamic';

interface AnswerItem {
  question_id: number;
  selected_answer: string;
  is_correct: boolean;
  score_earned: number;
}

interface SubmitBody {
  answers: AnswerItem[];
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 });
  }

  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: '请求格式不正确' }, { status: 400 });
  }
  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    return NextResponse.json({ error: '答案不能为空' }, { status: 400 });
  }
  for (const a of body.answers) {
    if (
      typeof a.question_id !== 'number' ||
      typeof a.selected_answer !== 'string' ||
      typeof a.is_correct !== 'boolean' ||
      typeof a.score_earned !== 'number'
    ) {
      return NextResponse.json({ error: '答案字段不合法' }, { status: 400 });
    }
  }

  const sb = getSupabase();
  const { data, error } = await sb.rpc('submit_answers', {
    p_user_id: payload.uid,
    p_answers: body.answers as unknown as Record<string, unknown>[],
  });
  if (error) {
    return NextResponse.json({ error: `提交失败：${error.message}` }, { status: 500 });
  }
  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ result: row });
}
