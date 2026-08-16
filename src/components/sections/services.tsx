import {
  BookOpen,
  Smartphone,
  Footprints,
  ShoppingBasket,
  Check,
} from "lucide-react";

const PILLARS = [
  {
    icon: <BookOpen size={30} strokeWidth={2} />,
    color: "bg-primary/60 text-primary-dark",
    title: "知识查询",
    desc: "健康、饮食、隔代育儿、防骗知识一查就懂",
    points: ["银发健康科普", "饮食营养搭配", "隔代育儿指南", "防骗安全提醒"],
  },
  {
    icon: <Smartphone size={30} strokeWidth={2} />,
    color: "bg-primary-dark text-white",
    title: "手机课堂",
    desc: "智能手机实操课，上网挂号、生活缴费、拍照一查就会",
    points: ["微信视频通话", "网上挂号缴费", "拍照发朋友圈", "防骚扰与诈骗"],
  },
  {
    icon: <Footprints size={30} strokeWidth={2} />,
    color: "bg-[#F6F6E8] text-primary-dark",
    title: "运动健康",
    desc: "步数记录追踪、居家健身跟练、线下运动活动组织",
    points: ["每日步数打卡", "居家太极八段锦", "线下健步走", "广场舞/腰鼓队"],
  },
  {
    icon: <ShoppingBasket size={30} strokeWidth={2} />,
    color: "bg-[#333333] text-white",
    title: "社区集市",
    desc: "生鲜农副产品、种菜交流分享、邻里线下市集活动",
    points: ["生鲜农副直供", "阳台种菜交流", "邻里手作交换", "便民服务摊位"],
  },
];

export function Services() {
  return (
    <section id="services" className="bg-white py-16 md:py-24">
      <div className="container-page">
        <div className="text-center">
          <span className="section-eyebrow justify-center">
            <span className="h-px w-8 bg-primary-dark" />
            适老服务
            <span className="h-px w-8 bg-primary-dark" />
          </span>
          <h2 className="section-title mt-3">四大服务 · 覆盖长辈日常</h2>
          <p className="section-subtitle mx-auto whitespace-nowrap">
            从学知识、用手机，到动起来、逛集市，大椿助老把长辈真正需要的服务搬到家门口。
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((s) => (
            <article
              key={s.title}
              className="group flex flex-col rounded-2xl border border-[#E8E4D0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-dark/40 hover:shadow-xl"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${s.color} transition-transform duration-300 group-hover:scale-105`}
              >
                {s.icon}
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#333333]">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#666666]">{s.desc}</p>
              <ul className="mt-4 space-y-2.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[15px] text-[#333333]">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-dark">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#contact"
            className="inline-flex h-14 items-center gap-2 rounded-full bg-primary-dark px-10 text-lg font-bold text-white shadow-lg transition hover:bg-[#5A6030]"
          >
            联系我们
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
