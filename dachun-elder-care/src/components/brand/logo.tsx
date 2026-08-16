import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** 渲染高度（px），宽度按图片真实比例自适应 */
  height?: number;
}

/**
 * 大椿助老官方 Logo
 * 直接引用 public/logo.png（官方横版：图标 + 大椿助老 + 标语），无 SVG 自绘。
 * 图片已精确裁掉四周及底部留白，比例约 2.74:1（横向）。
 */
export function Logo({ className, height = 44 }: LogoProps) {
  // 精确裁剪后尺寸 1781x650，比例约 2.74:1
  const aspectRatio = 1781 / 650;
  const width = Math.round(height * aspectRatio);

  return (
    <Image
      src="/logo.png"
      alt="大椿助老 — 社区助老·温暖相伴"
      width={width}
      height={height}
      priority
      unoptimized
      className={cn('w-auto select-none object-contain', className)}
      style={{ height: `${height}px`, width: 'auto' }}
    />
  );
}
