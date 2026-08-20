'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  HeartPulse,
  Apple,
  Baby,
  ShieldAlert,
  ArrowRight,
  Quote,
} from 'lucide-react';

interface CategoryItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bg: string;
  iconWrap: string;
  href?: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    icon: <HeartPulse size={32} strokeWidth={2} />,
    title: '银发健康',
    desc: '慢病养护、安全用药、体检解读，守护长辈身心健康。',
    bg: 'bg-[#F6F6E8]',
    iconWrap: 'bg-[#C8C978] text-[#7A8045]',
  },
  {
    icon: <Apple size={32} strokeWidth={2} />,
    title: '饮食营养',
    desc: '膳食搭配、老年食谱、慢病食疗，吃出均衡营养。',
    bg: 'bg-[#EDF1DC]',
    iconWrap: 'bg-[#7A8045] text-white',
  },
  {
    icon: <Baby size={32} strokeWidth={2} />,
    title: '隔代育儿',
    desc: '科学喂养、育儿技巧、亲子沟通，助力和谐隔代相处。',
    bg: 'bg-[#F6F6E8]',
    iconWrap: 'bg-[#C8C978] text-[#7A8045]',
    href: '/knowledge/yuer',
  },
  {
    icon: <ShieldAlert size={32} strokeWidth={2} />,
    title: '防骗安全',
    desc: '辨识各类骗局、警惕虚假推销，守住养老积蓄。',
    bg: 'bg-[#EDF1DC]',
    iconWrap: 'bg-[#7A8045] text-white',
  },
];

export function Knowledge() {
  return (
    <section id="knowledge" className="bg-white py-16 md:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow justify-center">
            <span className="h-px w-8 bg-primary-dark" />
            KNOWLEDGE CENTER
            <span className="h-px w-8 bg-primary-dark" />
          </span>
          <h2 className="section-title mt-3">助老知识库</h2>
          <p className="section-subtitle mx-auto">
            甄选可信科普内容，净化老年信息环境。
          </p>
        </div>

        {/* 4 个分类卡片：横排一排 */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
          {CATEGORIES.map((cat) => {
            const isLink = !!cat.href;
            return (
              <div
                key={cat.title}
                className={cn(
                  'flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E4D0]',
                  isLink
                    ? 'group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary-dark/30'
                    : 'opacity-70',
                )}
              >
                <div
                  className={cn(
                    'flex h-20 w-20 items-center justify-center self-center rounded-2xl',
                    cat.iconWrap,
                    isLink && 'transition-transform duration-300 group-hover:scale-105',
                    !isLink && 'grayscale',
                  )}
                >
                  {cat.icon}
                </div>
                <h3 className="mt-5 text-center text-xl font-bold text-[#333333]">
                  {cat.title}
                </h3>
                <p className="mt-3 text-center text-[15px] leading-relaxed text-[#666666]">
                  {cat.desc}
                </p>
                {isLink ? (
                  <Link
                    href={cat.href as string}
                    className="mt-5 inline-flex items-center justify-center gap-1 text-base font-bold text-primary-dark transition group-hover:gap-2"
                  >
                    开始答题
                    <ArrowRight size={17} strokeWidth={2.5} />
                  </Link>
                ) : (
                  <span className="mt-5 inline-flex items-center justify-center text-base font-medium text-[#9A9380]">
                    即将上线
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 创始人引言：为什么做知识库 —— 卡片下方，全宽横排，仅左侧竖边 */}
        <div className="mt-8 rounded-r-2xl border-l-4 border-primary bg-[#F6F6E8]/50 p-6 md:mt-10 md:p-8">
          <Quote
            size={28}
            strokeWidth={1.8}
            className="text-primary-dark/40"
          />
          <div className="mt-3 space-y-3 text-[15px] leading-8 text-[#555555] md:text-base md:leading-[2]">
            <p>
              很多人认为是老年人容易轻信网络不良内容。我们观察发现：核心问题并非长辈不愿学习，而是市面上缺少适合长者、内容靠谱、易于接纳的优质内容。粗制短剧、虚假养生资讯盛行，本质是优质供给长期缺位。
            </p>
            <p>
              我们选择以<strong className="font-bold text-primary-dark">隔代育儿</strong>作为切入场景：育儿理念冲突是当代家庭最高频的矛盾。长辈或许不愿为自身健康改变习惯，却愿意为孙辈主动学习科学知识。以此为起点，引导长辈接触可信内容，逐步建立健康信息获取习惯，进而延伸至健康、生活、社交等更多领域。
            </p>
          </div>
          <p className="mt-5 text-sm font-bold text-primary-dark">
            —— 大椿助老创始人
          </p>
        </div>
      </div>
    </section>
  );
}
