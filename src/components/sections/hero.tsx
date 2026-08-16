import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Hero 首屏 —— 严格对齐视觉稿：
 * - 极浅米黄背景 #FAF8F1
 * - 左右 5:5
 * - 主标题「社区助老·温暖相伴」黑色粗体 48px
 * - 副标题 #333，描述四大入口
 * - 主按钮深绿 #7A8045 白字 28px 圆角；副按钮白底深灰描边
 * - 右侧使用官方提供的精细插画（社工与老奶奶面对面交流）
 */
export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#FAF8F1] pb-3 pt-[84px] md:pb-4"
    >
      <div className="container-page grid items-center gap-6 lg:grid-cols-2 lg:gap-4">
        {/* 左：文案 */}
        <div>
          <h1 className="text-balance text-[34px] font-bold leading-[1.15] tracking-tight text-[#1A1A1A] md:text-[42px]">
            社区助老·温暖相伴
          </h1>

          <p className="mt-4 max-w-xl text-base leading-[1.7] text-[#333333] md:text-lg">
            为老年人提供知识查询、手机课堂、运动健康与社区集市服务
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="#knowledge"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[28px] bg-primary-dark px-7 py-2.5 text-base font-bold text-white shadow-[0_6px_18px_rgba(122,128,69,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#636837] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
            >
              开始使用
              <ArrowRight size={18} strokeWidth={2.6} />
            </Link>
            <Link
              href="#services"
              className="inline-flex min-h-[46px] items-center justify-center rounded-[28px] border border-[#666666] bg-white px-7 py-2.5 text-base font-bold text-[#333333] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-dark hover:text-primary-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
            >
              了解服务
            </Link>
          </div>
        </div>

        {/* 右：官方精细插画 */}
        <div className="relative mx-auto w-full max-w-[520px]">
          <Image
            src="/hero-illustration.png"
            alt="社区工作者与老年人面对面亲切交流"
            width={810}
            height={543}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
