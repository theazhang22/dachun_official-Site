import { NextRequest, NextResponse } from 'next/server';
import { browseQuestions } from '@/lib/knowledge/repo';
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

// 数据库实际枚举：difficulty ∈ {easy, medium, hard}
// question_type ∈ {single, case, judge}（judge 即判断题）
// 这里同时兼容中文（老前端可能传）和英文（真实值）
const DIFFICULTY_MAP: Record<string, string> = {
  简单: 'easy',
  中等: 'medium',
  较难: 'hard',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};
const TYPE_MAP: Record<string, string> = {
  A1单选题: 'single',
  A2病例题: 'case',
  判断题: 'judge',
  单选题: 'single',
  病例题: 'case',
  single: 'single',
  case: 'case',
  judge: 'judge',
};

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ageRaw = sp.get('age_group');
  const diffRaw = sp.get('difficulty');
  const typeRaw = sp.get('question_type');
  const category = sp.get('category');
  const q = sp.get('q')?.trim();
  const page = Math.max(1, Number(sp.get('page') ?? '1') || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get('pageSize') ?? '20') || 20));

  const age_group: AgeGroup | '全部' | undefined =
    ageRaw && ageRaw !== '全部' && AGE_GROUPS.has(ageRaw as AgeGroup)
      ? (ageRaw as AgeGroup)
      : ageRaw === '全部'
        ? '全部'
        : undefined;

  const difficulty =
    diffRaw && diffRaw !== '全部' && DIFFICULTY_MAP[diffRaw]
      ? DIFFICULTY_MAP[diffRaw]
      : undefined;
  const question_type =
    typeRaw && typeRaw !== '全部' && TYPE_MAP[typeRaw]
      ? TYPE_MAP[typeRaw]
      : undefined;

  try {
    const { data, count } = await browseQuestions({
      age_group,
      difficulty,
      question_type,
      category: category && category !== '全部' ? category : undefined,
      keyword: q || undefined,
      page,
      pageSize,
    });
    return NextResponse.json({
      data,
      count,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
