import {
  ShieldCheck,
  Users,
  Sparkles,
  Target,
  Heart,
  MessagesSquare,
  Quote,
  Check,
} from 'lucide-react';

const MISSIONS = [
  {
    icon: <ShieldCheck size={26} strokeWidth={2.1} />,
    title: '净化信息环境',
    desc: '筛选甄别优质科普内容，替代网络谣言、营销短剧，为长辈提供可信、实用的知识来源。',
  },
  {
    icon: <Users size={26} strokeWidth={2.1} />,
    title: '搭建社区联结',
    desc: '依托线上互动、线下社群活动，重建邻里交往，消解长辈孤独，拓宽社交圈子。',
  },
  {
    icon: <Sparkles size={26} strokeWidth={2.1} />,
    title: '激活自我价值',
    desc: '挖掘长辈空闲时间的意义，鼓励持续学习、参与社群，让晚年生活拥有成就感。',
  },
  {
    icon: <Target size={26} strokeWidth={2.1} />,
    title: '立足真实需求',
    desc: '以隔代育儿等高频家庭场景为切入点，解决两代人观念分歧，缓和家庭矛盾。',
  },
  {
    icon: <Heart size={26} strokeWidth={2.1} />,
    title: '坚守纯粹真诚',
    desc: '拒绝广告营销、虚假宣传，所有内容与活动，始终站在长辈真实需求出发。',
  },
  {
    icon: <MessagesSquare size={26} strokeWidth={2.1} />,
    title: '坚持双向连接',
    desc: '打破单向知识灌输，打造互动交流空间，促进长者之间、长者与社区持续沟通。',
  },
];

const BRAND_TAGS = ['可信科普', '邻里社群', '家庭和谐', '长者赋能'];

export function About() {
  return (
    <section id="about" className="bg-background py-20 md:py-28">
      <div className="container-page">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* 左侧：品牌叙事 */}
          <div>
            <span className="section-eyebrow">
              <span className="h-px w-8 bg-primary-dark" />
              ABOUT DACHUN
            </span>
            <h2 className="section-title mt-3">
              大椿助老·重建长辈
              <br />
              充实美好的晚年生活
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-loose text-[#666666]">
              <p>
                当下许多长辈花费大量时间浏览网络信息，却常常被劣质短剧、养生谣言、营销广告包围；隔代相处理念冲突、邻里关系疏远，精神生活缺少寄托。
              </p>
              <p>
                大椿助老希望补齐适合老年人的优质内容供给，搭建线上线下相融的社区平台，让长辈收获可信知识、重拾邻里联结，拥有充实、自在、有价值的晚年时光。
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border">
              <Quote
                size={28}
                strokeWidth={1.8}
                className="text-primary-dark/40"
              />
              <p className="mt-3 text-lg leading-relaxed text-[#333333]">
                "我们不只想做内容，更希望让每一位长者的晚年时光，变得干净、充实、富有连接。"
              </p>
              <p className="mt-3 text-sm font-bold text-primary-dark">
                —— 大椿助老创始人
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {BRAND_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-dark ring-1 ring-primary/50"
                >
                  <Check size={16} strokeWidth={2.6} className="text-primary" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧：6 个使命卡片 */}
          <div className="grid gap-5 sm:grid-cols-2">
            {MISSIONS.map((m, i) => (
              <div
                key={m.title}
                className="group rounded-2xl border border-[#C8C978]/50 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-dark/40 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-dark transition group-hover:bg-primary-dark group-hover:text-white">
                    {m.icon}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-primary-pale">
                      0{i + 1}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-primary-dark">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#666666]">
                      {m.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
