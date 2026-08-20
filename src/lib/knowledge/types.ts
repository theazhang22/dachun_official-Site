// 年龄段（题目当前没有独立 age_group 列，从 topic_tags 中识别）
export type AgeGroup =
  | '0-3月'
  | '3-6月'
  | '6-12月'
  | '1-2岁'
  | '2-3岁'
  | '3-6岁';

// 数据库里 difficulty/question_type 是自由字符串，这里用宽松类型
// UI 层通过 LABEL_DIFFICULTY / LABEL_QUESTION_TYPE 做中文映射
export type Difficulty = string;
export type QuestionType = string;

/** dachun_sources */
export interface Source {
  id: number;
  slug?: string | null;
  short_name: string;
  full_name?: string | null;
  org_name?: string | null;
  year?: string | null;
  source_group?: string | null;
  source_type?: string | null;
  official_url?: string | null;
  abstract?: string | null;
  key_recommendations?: string[] | null;
  question_count?: number | null;
  isbn?: string | null;
  topics?: string[] | null;
  access_type?: string | null;
  org_logo_url?: string | null;
  status?: string | null;
  superseded_by?: number | null;
}

/** dachun_options */
export interface Option {
  id: number;
  question_id: number;
  option_label: string; // A/B/C/D/E 或 True/False
  content: string;
  is_correct: boolean;
  distractor_type: string | null;
  sort_order: number | null;
}

/** dachun_questions（仅前端真正会用到的列） */
export interface QuestionRow {
  id: number;
  public_id: string | null;
  category: string | null;
  topic_tags: string[] | null;
  difficulty: string | null;
  question_type: string | null;
  cognitive_level: string | null;
  question: string;
  answer: string | null;
  explanation: string | null;
  // 题目表内置的来源（jsonb），作为来源关联表的兜底
  sources?: unknown;
  ai_verified?: boolean | null;
  review_note?: string | null;
  version: number | null;
  status: string | null;
}

/** dachun_source_question_map（关联表，含原文锚点） */
export interface SourceQuestionMap {
  id: number;
  source_id: number;
  question_id: number;
  ref_type: string | null;
  recommendation_note: string | null;
  anchor_text: string | null;
  information_points: string[] | null;
}

export interface Question extends QuestionRow {
  // 从 topic_tags 解析出的年龄段（一道题可命中多个段）
  age_groups: AgeGroup[];
  // 从 topic_tags 解析出的主分类（用于筛选）
  categories: string[];
  options: Option[];
  sources: Source[];
  source_maps: SourceQuestionMap[];
}

export interface QuizFilters {
  age_group?: AgeGroup | '全部';
  category?: string;
}

export interface BrowseFilters extends QuizFilters {
  difficulty?: string;
  question_type?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}
