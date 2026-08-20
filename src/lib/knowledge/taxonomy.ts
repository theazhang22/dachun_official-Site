import type { AgeGroup } from './types';

/**
 * 题型枚举与中文映射（数据库实际取值：single / case / judge）
 */
export const QUESTION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'single', label: '单选题' },
  { value: 'case', label: '病例题' },
  { value: 'judge', label: '判断题' },
];

export const LABEL_QUESTION_TYPE: Record<string, string> = {
  single: '单选题',
  case: '病例题',
  judge: '判断题',
};

/**
 * 难度枚举与中文映射
 */
export const DIFFICULTY_OPTIONS: { value: string; label: string }[] = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '较难' },
];

export const LABEL_DIFFICULTY: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '较难',
};

/**
 * 年龄段 → 用于匹配 topic_tags 的关键词。
 * 一道题可能命中多个段（例如标签同时含 "6-12月" 和 "1岁"）。
 * 关键词按"特异→宽泛"排序，避免误匹配。
 */
// 注意：匹配使用 String.includes，故越具体的标签越靠前。
// 禁止把 "3-6月" 这种短串放进 3-6岁组——会误命中 "3-6月龄"。
export const AGE_GROUP_KEYWORDS: Record<AgeGroup, string[]> = {
  '0-3月': [
    '0-3月',
    '0-3月龄',
    '0-6月',
    '0-6月龄',
    '新生儿',
    '2月龄',
    '3月龄以下',
    '足月儿',
    '早产儿',
    'NICU',
    '出生体重',
  ],
  '3-6月': [
    '3-6月',
    '3-6月龄',
    '4月龄',
    '5月龄',
    '4-11月龄',
  ],
  '6-12月': [
    '6-12月',
    '6-12月龄',
    '6-12m',
    '6月龄',
    '7-24月',
    '7-24月龄',
    '7-12月龄',
    '8月龄',
    '9月龄',
    '10月龄',
    '11月龄',
    '12月龄',
    '12-23月',
    '18月以下',
  ],
  '1-2岁': [
    '1-2岁',
    '1岁',
    '1岁内',
    '15月龄',
    '18月龄',
    '18-24月',
    '18-24月龄',
    '20月龄',
  ],
  '2-3岁': [
    '2-3岁',
    '24月龄',
    '30月龄',
    '2岁',
    '3岁以下',
  ],
  '3-6岁': [
    '3-6岁',
    '3-4岁',
    '4-5岁',
    '4-6岁',
    '5-6岁',
    '3岁',
    '4岁',
    '5岁',
    '6岁',
    '学龄前',
    '幼儿园',
    '入园',
    '托幼',
  ],
};

export const AGE_GROUPS: AgeGroup[] = [
  '0-3月',
  '3-6月',
  '6-12月',
  '1-2岁',
  '2-3岁',
  '3-6岁',
];

/**
 * 分类标签（按 topic_tags 关键词归类）。
 * value 是分类主键；label 是中文展示；match 是命中任一关键词即归入该分类。
 */
export interface CategoryDef {
  value: string;
  label: string;
  match: string[];
}

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    value: 'newborn',
    label: '新生儿护理',
    match: ['新生儿', '脐带护理', '黄疸', '母乳性黄疸', '光疗', '胆红素', '早产儿', '新生儿复苏', '新生儿访视', '新生儿筛查', '尿布疹', '胎脂', '新生儿皮疹'],
  },
  {
    value: 'feeding',
    label: '母乳喂养',
    match: ['母乳喂养', '母乳', '配方奶', '辅食添加', '辅食', '纯母乳喂养', '混合喂养', '储存母乳', '含接姿势', '初乳', '开奶', '断奶时机', '回应式喂养', '奶量判断', '冲调浓度', '婴儿喂养'],
  },
  {
    value: 'vaccine',
    label: '疫苗接种',
    match: ['疫苗接种', '疫苗', '免疫程序', '卡介苗', '乙肝疫苗', '百白破', '脊灰疫苗', '麻腮风', '13价肺炎', '流感疫苗', '水痘疫苗', '甲肝疫苗', '轮状病毒', '补种规则', '接种禁忌', '接种间隔', '接种证', '非免疫规划', '自费疫苗', '不良反应', '免疫接种'],
  },
  {
    value: 'growth',
    label: '生长发育',
    match: ['生长发育', '发育里程碑', '大运动', '精细运动', '语言发育', '语言', '认知发展', '发育评估', '生长曲线', 'Z评分', 'BMI', '头围', '身长', '体重增长', '发育行为', '社交情绪', '里程碑', 'CDC里程碑', '动作发展', '发育预警', '发育监测', '发育异常'],
  },
  {
    value: 'nutrition',
    label: '营养补充',
    match: ['维生素D', '维生素A', '铁剂', '补铁', 'DRIs', 'DRI', '营养', '营养评估', '营养喂养', '膳食指南', '膳食宝塔', '食物多样', '蛋白质', '营养补充', '贫血', '缺铁性贫血', '佝偻病', '牛奶蛋白过敏', '食物过敏'],
  },
  {
    value: 'safety',
    label: '急救安全',
    match: ['急救', '心肺复苏', 'CPR', 'AED', '异物窒息', '烧烫伤', '溺水', '跌落', '交通', '安全座椅', '乘车安全', '安全睡眠', 'SIDS', '伤害预防', '儿童安全', '居家安全', '家庭安全', '家庭急救', '中毒', '误服', '窒息预防', '家具固定', '窗户护栏', '热水', '冲脱泡盖送'],
  },
  {
    value: 'sleep',
    label: '睡眠指导',
    match: ['睡眠', '睡眠时长', '睡眠环境', '安全睡眠', 'SIDS预防', '仰卧睡姿', '作息规律', '午睡', '规律作息', '睡眠习惯', '同床风险', '奶睡', '睡眠呼吸暂停', '俯卧位'],
  },
  {
    value: 'skin',
    label: '过敏湿疹',
    match: ['湿疹', '过敏', '牛奶蛋白过敏', '食物过敏', '皮肤护理', '热疹', '痱子', '保湿', '润肤剂', '蒙古斑', '尿布疹', '特应性皮炎'],
  },
  {
    value: 'dental',
    label: '口腔保健',
    match: ['口腔保健', '口腔', '刷牙', '乳牙萌出', '含氟牙膏', '龋齿预防', '窝沟封闭', '口腔保健'],
  },
  {
    value: 'illness',
    label: '常见疾病',
    match: ['发热', '咳嗽', '肺炎', '腹泻', '急性腹泻', '感冒', '手足口病', '麻疹', '热性惊厥', '中耳炎', '扁桃体炎', '哮喘', '便秘', '支原体', '病毒感染', '抗生素', '退热药', '对乙酰氨基酚', '布洛芬'],
  },
  {
    value: 'screen',
    label: '屏幕时间',
    match: ['屏幕时间', '电子媒体', '久坐行为', '久坐限制', '视频通话', '含糖饮料', 'MVPA', '身体活动', '束缚时间'],
  },
  {
    value: 'psychology',
    label: '心理与行为',
    match: ['心理健康', '情绪', '发脾气', '行为管理', '分离焦虑', '陌生人焦虑', '依恋', '孤独症', '共情', '正面管教', '语言发展', '社交', '情绪调节', '情绪发展', '认知'],
  },
];

/**
 * 从 topic_tags 中解析所属年龄段。
 */
export function detectAgeGroups(tags: string[] | null | undefined): AgeGroup[] {
  if (!tags || tags.length === 0) return [];
  const hits = new Set<AgeGroup>();
  for (const ag of AGE_GROUPS) {
    const keywords = AGE_GROUP_KEYWORDS[ag];
    for (const t of tags) {
      for (const kw of keywords) {
        if (t && t.includes(kw)) {
          hits.add(ag);
          break;
        }
      }
    }
  }
  return [...hits];
}

/**
 * 从 topic_tags 中解析所属分类。
 */
export function detectCategories(tags: string[] | null | undefined): string[] {
  if (!tags || tags.length === 0) return [];
  const hits = new Set<string>();
  for (const def of CATEGORY_DEFS) {
    for (const t of tags) {
      for (const kw of def.match) {
        if (t && t.includes(kw)) {
          hits.add(def.value);
          break;
        }
      }
    }
  }
  return [...hits];
}
