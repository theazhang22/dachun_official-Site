import { getSupabase } from '@/lib/supabase';
import type {
  AgeGroup,
  BrowseFilters,
  Option,
  Question,
  QuestionRow,
  Source,
  SourceQuestionMap,
} from './types';
import {
  AGE_GROUPS,
  AGE_GROUP_KEYWORDS,
  CATEGORY_DEFS,
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  detectAgeGroups,
  detectCategories,
} from './taxonomy';

export { AGE_GROUPS, CATEGORY_DEFS, DIFFICULTY_OPTIONS, QUESTION_TYPE_OPTIONS };

/**
 * 介绍页的年龄分布可视化数据。
 * 数值按当前 dachun_questions 中 80 道 reviewed 题目实际分布设置，
 * 后续题库扩容时手工更新即可。
 */
// 命题规范中定义的题库年龄段分布目标（百分比之和=100）
export const AGE_DISTRIBUTION: { label: AgeGroup; percent: number }[] = [
  { label: '0-3月', percent: 20 },
  { label: '3-6月', percent: 17 },
  { label: '6-12月', percent: 20 },
  { label: '1-2岁', percent: 17 },
  { label: '2-3岁', percent: 14 },
  { label: '3-6岁', percent: 12 },
];

export function difficultyLabel(v: string | null | undefined): string {
  if (!v) return '';
  const hit = DIFFICULTY_OPTIONS.find((d) => d.value === v);
  return hit?.label ?? v;
}

export function questionTypeLabel(v: string | null | undefined): string {
  if (!v) return '';
  const hit = QUESTION_TYPE_OPTIONS.find((t) => t.value === v);
  return hit?.label ?? v;
}

// 首页/介绍页展示的分类标签（用于标签云）
export const CATEGORY_TAGS: string[] = CATEGORY_DEFS.map((c) => c.label);

export const AUTHORITY_ORGS = [
  { short: 'WHO', full: '世界卫生组织' },
  { short: 'AAP', full: '美国儿科学会' },
  { short: 'CDC', full: '美国疾控中心' },
  { short: '中国营养学会', full: '中国营养学会' },
  { short: '中华医学会儿科学分会', full: '中华医学会儿科学分会' },
  { short: '国家卫健委', full: '国家卫生健康委员会' },
  { short: '中国疾控中心', full: '中国疾病预防控制中心' },
];

// 题目表字段（严格对齐 schema，避免查询不存在的列）
const QUESTION_SELECT =
  'id, public_id, category, topic_tags, difficulty, question_type, cognitive_level, question, answer, explanation, sources, status, ai_verified, review_note, version';

const OPTION_SELECT =
  'id, question_id, option_label, content, is_correct, distractor_type, sort_order';

const SOURCE_SELECT =
  'id, slug, short_name, full_name, org_name, source_group, source_type, year, isbn, topics, access_type, official_url, abstract, key_recommendations, question_count';

const MAP_SELECT =
  'id, source_id, question_id, ref_type, recommendation_note, anchor_text, information_points';

function safeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.filter((t): t is string => typeof t === 'string');
  if (typeof tags === 'string' && tags.length > 0) {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.filter((t): t is string => typeof t === 'string');
    } catch {
      return tags.split(/[,，|]/).map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
}

function normalizeQuestion(row: Record<string, unknown>): Question {
  const tags = safeTags(row.topic_tags);
  // 数据库的 sources(jsonb) 字段当前由来源关联表统一处理，这里忽略
  const { sources: _ignoredSources, ...rest } = row as Record<string, unknown>;
  void _ignoredSources;
  return {
    ...(rest as unknown as QuestionRow),
    topic_tags: tags.length > 0 ? tags : null,
    age_groups: detectAgeGroups(tags),
    categories: detectCategories(tags),
    options: [],
    sources: [],
    source_maps: [],
  };
}

async function attachOptionsAndSources(questions: Question[]): Promise<Question[]> {
  if (questions.length === 0) return questions;
  const sb = getSupabase();
  const ids = questions.map((q) => q.id);

  const [{ data: optionsData, error: optErr }, { data: mapData, error: mapErr }] =
    await Promise.all([
      sb
        .from('dachun_options')
        .select(OPTION_SELECT)
        .in('question_id', ids),
      sb
        .from('dachun_source_question_map')
        .select(MAP_SELECT)
        .in('question_id', ids),
    ]);

  if (optErr) throw new Error(`选项查询失败: ${optErr.message}`);
  if (mapErr) throw new Error(`来源关联查询失败: ${mapErr.message}`);

  // 选项：优先 sort_order，其次按 label 字母序
  const optionsByQ = new Map<number, Option[]>();
  for (const o of (optionsData ?? []) as Option[]) {
    const list = optionsByQ.get(o.question_id) ?? [];
    list.push(o);
    optionsByQ.set(o.question_id, list);
  }
  for (const list of optionsByQ.values()) {
    list.sort((a, b) => {
      if (a.sort_order != null && b.sort_order != null) return a.sort_order - b.sort_order;
      if (a.sort_order != null) return -1;
      if (b.sort_order != null) return 1;
      return a.option_label.localeCompare(b.option_label);
    });
  }

  // 来源关联 + 批量查来源详情
  const sourceIds = Array.from(new Set((mapData ?? []).map((m) => m.source_id)));
  const sourceMap = new Map<number, Source>();
  if (sourceIds.length > 0) {
    const { data: sourcesData, error: srcErr } = await sb
      .from('dachun_sources')
      .select(SOURCE_SELECT)
      .in('id', sourceIds);
    if (srcErr) throw new Error(`来源查询失败: ${srcErr.message}`);
    for (const s of sourcesData ?? []) sourceMap.set(s.id, s as Source);
  }

  const mapsByQ = new Map<number, SourceQuestionMap[]>();
  const sourcesByQ = new Map<number, Source[]>();
  for (const m of (mapData ?? []) as SourceQuestionMap[]) {
    const mapList = mapsByQ.get(m.question_id) ?? [];
    mapList.push(m);
    mapsByQ.set(m.question_id, mapList);
    const s = sourceMap.get(m.source_id);
    if (s) {
      const list = sourcesByQ.get(m.question_id) ?? [];
      list.push(s);
      sourcesByQ.set(m.question_id, list);
    }
  }

  return questions.map((q) => ({
    ...q,
    options: optionsByQ.get(q.id) ?? [],
    sources: sourcesByQ.get(q.id) ?? [],
    source_maps: mapsByQ.get(q.id) ?? [],
  }));
}

export async function listSources(): Promise<Source[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('dachun_sources')
    .select(SOURCE_SELECT)
    .order('id', { ascending: true });
  if (error) throw new Error(`来源列表查询失败: ${error.message}`);
  return (data ?? []) as Source[];
}

export async function countActiveQuestions(): Promise<number> {
  const sb = getSupabase();
  const { count, error } = await sb
    .from('dachun_questions')
    .select('id', { count: 'exact', head: true })
    .in('status', ['active', 'reviewed']);
  if (error) throw new Error(`题目计数失败: ${error.message}`);
  return count ?? 0;
}

interface RawQuestionList {
  data: Question[];
  count: number;
}

async function queryQuestions(
  filters: BrowseFilters,
  random: boolean,
): Promise<RawQuestionList> {
  const sb = getSupabase();
  const pageSize = filters.pageSize ?? 10;
  const page = filters.page ?? 1;

  let query = sb
    .from('dachun_questions')
    .select(QUESTION_SELECT)
    .in('status', ['active', 'reviewed']);

  // 年龄段：用 overlaps 在数据库做一层粗筛（缩小结果集），内存中再精确判定
  if (filters.age_group && filters.age_group !== '全部') {
    const keywords = AGE_GROUP_KEYWORDS[filters.age_group as AgeGroup] ?? [];
    if (keywords.length > 0) {
      query = query.overlaps('topic_tags', keywords);
    }
  }

  // 分类：前端传英文 value（newborn/feeding/...），映射到一组中文关键词后用 overlaps 匹配
  let categoryKeywords: string[] | null = null;
  if (filters.category && filters.category !== '全部') {
    const def =
      CATEGORY_DEFS.find((c) => c.value === filters.category) ??
      CATEGORY_DEFS.find((c) => c.label === filters.category);
    if (def) categoryKeywords = def.match;
  }
  if (categoryKeywords && categoryKeywords.length > 0) {
    query = query.overlaps('topic_tags', categoryKeywords);
  }
  if (filters.difficulty && filters.difficulty !== '全部') {
    query = query.eq('difficulty', filters.difficulty);
  }
  if (filters.question_type && filters.question_type !== '全部') {
    query = query.eq('question_type', filters.question_type);
  }
  if (filters.keyword) {
    query = query.ilike('question', `%${filters.keyword}%`);
  }

  // 一次性拉取候选（上限 5000，足够覆盖当前 1975 题），所有过滤在内存完成，
  // 避免 DB 粗筛 + range 分页导致 count 与实际条数不一致。
  query = query.order('id', { ascending: false }).limit(5000);

  const { data, error } = await query;
  if (error) throw new Error(`题目查询失败: ${error.message}`);

  let rows = (data ?? []).map((r) => normalizeQuestion(r as Record<string, unknown>));

  // 年龄段精确过滤（overlaps 是 OR 命中，可能包含相邻段误匹配的题）
  if (filters.age_group && filters.age_group !== '全部') {
    const target = filters.age_group as AgeGroup;
    rows = rows.filter((r) => r.age_groups.includes(target));
  }

  if (random) {
    for (let i = rows.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rows[i], rows[j]] = [rows[j], rows[i]];
    }
    return { data: rows.slice(0, pageSize), count: rows.length };
  }

  const total = rows.length;
  const from = (page - 1) * pageSize;
  const paged = rows.slice(from, from + pageSize);
  return { data: paged, count: total };
}

export async function getQuizQuestions(
  filters: { age_group?: AgeGroup | '全部'; category?: string } = {},
  size = 10,
): Promise<Question[]> {
  const { data } = await queryQuestions({ ...filters, pageSize: 500 }, true);
  const picked = data.slice(0, size);
  return attachOptionsAndSources(picked);
}

export async function browseQuestions(
  filters: BrowseFilters,
): Promise<{ data: Question[]; count: number }> {
  const { data, count } = await queryQuestions(filters, false);
  const enriched = await attachOptionsAndSources(data);
  return { data: enriched, count };
}

export async function getQuestionById(id: number): Promise<Question | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('dachun_questions')
    .select(QUESTION_SELECT)
    .eq('id', id)
    .in('status', ['active', 'reviewed'])
    .maybeSingle();
  if (error) throw new Error(`题目查询失败: ${error.message}`);
  if (!data) return null;
  const q = normalizeQuestion(data as Record<string, unknown>);
  const [withRel] = await attachOptionsAndSources([q]);
  return withRel;
}

/**
 * 把可能是字符串形式的解析拆分为三段：正确做法 / 干扰项为什么错 / 何时需要看医生。
 * 支持 JSON 或【xxx】文本分段。
 */
export interface ParsedExplanation {
  correct: string;
  distractor: string;
  doctor: string;
}

export function parseExplanation(raw: string | null | undefined): ParsedExplanation {
  const empty: ParsedExplanation = { correct: '', distractor: '', doctor: '' };
  if (!raw) return empty;
  const text = raw.trim();
  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text) as Record<string, unknown>;
      return {
        correct: (obj.correct as string) || (obj.正确做法 as string) || '',
        distractor:
          (obj.distractor as string) || (obj.干扰项为什么错 as string) || '',
        doctor: (obj.doctor as string) || (obj.何时需要看医生 as string) || '',
      };
    } catch {
      // 继续走文本切分
    }
  }
  const segments = text.split(
    /【(正确做法|干扰项为什么错|何时需要看医生|正确答案解析|解析|答案|说明)】|#\s*(正确做法|干扰项为什么错|何时需要看医生)|(?:^|\n)\s*(正确做法[:：]|干扰项为什么错[:：]|何时需要看医生[:：])/g,
  );
  if (segments.length <= 1) {
    return { ...empty, correct: text };
  }
  let currentKey: keyof ParsedExplanation | null = null;
  const result: ParsedExplanation = { correct: '', distractor: '', doctor: '' };
  for (const seg of segments) {
    if (!seg) continue;
    const trimmed = seg.trim();
    if (trimmed === '正确做法' || trimmed === '正确做法:' || trimmed === '正确做法：') {
      currentKey = 'correct';
    } else if (
      trimmed === '干扰项为什么错' ||
      trimmed === '干扰项为什么错:' ||
      trimmed === '干扰项为什么错：'
    ) {
      currentKey = 'distractor';
    } else if (
      trimmed === '何时需要看医生' ||
      trimmed === '何时需要看医生:' ||
      trimmed === '何时需要看医生：'
    ) {
      currentKey = 'doctor';
    } else if (
      trimmed === '解析' ||
      trimmed === '答案' ||
      trimmed === '说明' ||
      trimmed === '正确答案解析'
    ) {
      currentKey = 'correct';
    } else if (currentKey) {
      result[currentKey] = (result[currentKey] + '\n' + trimmed).trim();
    } else {
      result.correct = (result.correct + '\n' + trimmed).trim();
    }
  }
  return result;
}
