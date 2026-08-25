import { NextResponse } from 'next/server';
import { listSources, countActiveQuestions } from '@/lib/knowledge/repo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [sources, count] = await Promise.all([listSources(), countActiveQuestions()]);
    return NextResponse.json({ sources, count });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
