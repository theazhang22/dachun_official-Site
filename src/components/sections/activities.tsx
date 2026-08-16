import {
  Users,
  MapPin,
  CalendarDays,
  ArrowRight,
  Leaf,
  Smartphone,
  Footprints,
  ShoppingBasket,
} from 'lucide-react';

const SCHEDULE = [
  { name: '八段锦晨练', cat: '运动健康' },
  { name: '智能手机实操课', cat: '手机课堂' },
  { name: '广场舞 & 腰鼓兴趣团', cat: '运动健康' },
  { name: '邻里市集·种菜交流', cat: '社区集市' },
];

const CARDS = [
  {
    icon: <Smartphone size={24} strokeWidth={1.8} />,
    title: '智能手机实操课',
    desc: '零基础智能手机实操教学，涵盖线上办事、生活缴费、相片分享、微信日常使用，循序渐进手把手教学。',
    items: [
      { icon: <Users size={18} />, label: '适合人群', value: '有智能设备学习需求的中老年长辈' },
    ],
  },
  {
    icon: <Footprints size={24} strokeWidth={1.8} />,
    title: '步数打卡·居家健身',
    desc: '开展线上步数打卡、居家太极、八段锦练习，后续适时组织线下健步交流活动，倡导日常适度锻炼。',
    items: [
      { icon: <Users size={18} />, label: '适合人群', value: '行动自如、喜爱健身运动的长辈' },
    ],
  },
  {
    icon: <ShoppingBasket size={24} strokeWidth={1.8} />,
    title: '邻里市集·种菜交流',
    desc: '搭建邻里交流平台，分享阳台种菜经验、农副好物与手工物件互换，营造热闹和睦的社区氛围。',
    items: [
      { icon: <MapPin size={18} />, label: '参与方式', value: '活动开放后可到场参与或提前登记' },
    ],
  },
];

export function Activities() {
  return (
    <section id="activities" className="bg-[#EDF0E0] py-20 md:py-28">
      <div className="container-page">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          {/* 左侧：标题 + 活动规划一览 */}
          <div>
            <span className="section-eyebrow">
              <span className="h-px w-8 bg-primary-dark" />
              COMMUNITY ACTIVITIES
            </span>
            <h2 className="section-title mt-3">
              社区活动·重拾邻里热闹时光
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-loose text-[#666666]">
              我们计划持续推出智能手机课堂、居家健身、邻里市集等多元社群活动。期待长辈相聚相识，学习新技能、结识邻里，丰富日常精神生活。
            </p>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={22}
                    strokeWidth={2}
                    className="text-primary-dark"
                  />
                  <h3 className="text-lg font-bold text-primary-dark">
                    活动规划一览
                  </h3>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-dark">
                  持续更新
                </span>
              </div>
              <ul className="mt-5 divide-y divide-border">
                {SCHEDULE.map((item) => (
                  <li key={item.name} className="flex items-center gap-4 py-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
                      <Leaf size={16} className="text-primary-dark" />
                    </span>
                    <div>
                      <p className="font-bold text-[#333333]">{item.name}</p>
                      <p className="text-sm text-[#999999]">{item.cat}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 右侧：三张活动卡 */}
          <div className="grid gap-5 sm:grid-cols-2">
            {CARDS.map((card) => (
              <article
                key={card.title}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/40 text-primary-dark">
                    {card.icon}
                  </span>
                  <h3 className="text-lg font-bold leading-tight text-[#333333]">
                    {card.title}
                  </h3>
                </div>

                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-[#666666]">
                  {card.desc}
                </p>

                <ul className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm text-[#666666]">
                  {card.items.map((item) => (
                    <li key={item.label} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-primary-dark">{item.icon}</span>
                      <span className="shrink-0 whitespace-nowrap text-[#999999]">{item.label}：</span>
                      <span className="text-[#333333]">{item.value}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-dark px-6 text-base font-bold text-white transition hover:bg-[#5A5F33]"
                >
                  活动报名
                  <ArrowRight size={18} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
