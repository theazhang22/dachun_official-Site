import { NextRequest, NextResponse } from 'next/server';
import { getQuizQuestions } from '@/lib/knowledge/repo';
import type { AgeGroup } from '@/lib/knowledge/types';

export const dynamic = 'force-dynamic';

const AGE_GROUPS = new Set<AgeGroup>([
  '0-3月',
  '3-6月',
  '6-12月',
  '1-2岁',
  '2-3岁',
  '3-6岁',
]);

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ageRaw = sp.get('age_group');
  const category = sp.get('category') ?? undefined;
  const size = Math.min(30, Math.max(5, Number(sp.get('size') ?? '10') || 10));

  const age_group: AgeGroup | undefined =
    ageRaw && ageRaw !== '全部' && AGE_GROUPS.has(ageRaw as AgeGroup)
      ? (ageRaw as AgeGroup)
      : undefined;

  try {
    const questions = await getQuizQuestions({ age_group, category }, size);
    return NextResponse.json({ data: questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
