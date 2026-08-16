import { BookOpen, Smartphone, Footprints, ShoppingBasket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  title: string;
  desc: string;
  icon: LucideIcon;
  /** 图标容器底色 */
  iconBg: string;
  /** 图标颜色 */
  iconColor: string;
}

const FEATURES: Feature[] = [
  {
    title: '知识查询',
    desc: '健康、饮食、隔代育儿、防骗等知识一查就懂',
    icon: BookOpen,
    iconBg: '#EFEFB8',
    iconColor: '#7A8045',
  },
  {
    title: '手机课堂',
    desc: '智能手机实操课，上网挂号、生活缴费、拍照一查就会',
    icon: Smartphone,
    iconBg: '#7A8045',
    iconColor: '#FFFFFF',
  },
  {
    title: '运动健康',
    desc: '步数记录追踪、居家健身跟练、线下运动活动组织',
    icon: Footprints,
    iconBg: '#F6F6E8',
    iconColor: '#7A8045',
  },
  {
    title: '社区集市',
    desc: '生鲜农副产品、种菜交流分享、邻里线下市集活动',
    icon: ShoppingBasket,
    iconBg: '#333333',
    iconColor: '#FFFFFF',
  },
];

export function Features() {
  return (
    <section className="relative z-10 -mt-2 pb-6 md:pb-8">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.title}
                className="group flex flex-col items-center rounded-2xl bg-white px-5 py-6 text-center shadow-[0_6px_24px_rgba(51,51,51,0.08)] ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(51,51,51,0.12)]"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: f.iconBg, color: f.iconColor }}
                  aria-hidden="true"
                >
                  <Icon size={26} strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-xl font-bold text-[#1A1A1A] md:text-[22px]">
                  {f.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#666666]">
                  {f.desc}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
