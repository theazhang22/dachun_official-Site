# AGENTS.md

## 项目概览

- **项目名**：大椿助老（DaChun Elder Care）官网
- **定位**：老年友好的社区助老服务官方网站，面向 60+ 长辈及其 40-55 岁子女
- **域**：单页营销官网（营销落地页 + 预约咨询表单）
- **核心诉求**：大字、清晰、温暖、可信；默认字号 18px，可切"大字模式"放大 20%

## 技术栈

- **Framework**: Next.js 16（App Router）
- **Core**: React 19
- **Language**: TypeScript 5（strict）
- **UI**: shadcn/ui（`src/components/ui/`，本项目主要使用原生 Tailwind，未大量引入）
- **Styling**: Tailwind CSS v4（`@theme inline` 注册 token，见 `src/app/globals.css`）
- **图标**: `lucide-react`
- **包管理**: pnpm（强制）

## 目录结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局（A11yProvider + Header + Footer + Toolbar）
│   ├── page.tsx            # 首页（组合所有 section）
│   ├── globals.css         # 全局样式与 Design Token
│   └── favicon.ico
├── components/
│   ├── a11y/               # 老年友好：模式切换、工具条、回顶
│   │   ├── a11y-provider.tsx
│   │   ├── a11y-toolbar.tsx
│   │   └── back-to-top.tsx
│   ├── brand/
│   │   └── logo.tsx        # 大椿助老品牌 Logo（SVG 自绘）
│   ├── layout/
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── sections/           # 首页各区块
│   │   ├── hero.tsx
│   │   ├── services.tsx
│   │   ├── why-us.tsx
│   │   ├── process.tsx
│   │   ├── stories.tsx
│   │   ├── team.tsx
│   │   └── contact.tsx
│   └── ui/                 # shadcn/ui 预置组件
└── lib/
    └── utils.ts            # cn() 等工具
```

## 设计 Token（见 globals.css）

| Token | 颜色 | 用途 |
|-------|------|------|
| `--primary` | `#3F7A4E` 椿绿 | 主色、主按钮、导航 |
| `--primary-dark` | `#2E5E3B` | hover/深色 |
| `--accent` | `#D97B4A` 陶土橙 | CTA、紧急、强调 |
| `--danger` | `#C84B3A` | 紧急呼救 |
| `--background` | `#FAF6EE` 暖米白 | 页面底色 |
| `--foreground` | `#3D3328` 墨褐 | 正文 |
| `--muted-foreground` | `#6B5D4B` | 次要文字（不浅于此） |
| `--border` | `#E5DCCB` | 描边 |

## 常用命令

```bash
pnpm install         # 安装依赖
pnpm dev             # 启动开发（HMR，端口从 ${DEPLOY_RUN_PORT} 读）
pnpm build           # 生产构建
pnpm start           # 启动生产
pnpm ts-check        # TypeScript 类型检查
pnpm lint            # ESLint
pnpm lint:style      # Stylelint
```

## 编码规范

- **严格 TS**：禁止 `any`/`as any`，函数参数必须标注类型，清理未用 import。
- **字体/字号**：基准 18px、行高 1.7。任何正文字号不得小于 16px，次要文字色不得浅于 `#6B5D4B`。
- **按钮可点击区域**：最小 48×48px；`.senior-mode` 下 56×56px。
- **颜色不做唯一信息载体**：按钮同时有图标+文字；错误同时有图标+文字。
- **焦点可见**：所有可聚焦元素有 3px椿绿 `outline`（已在 globals.css 全局设置）。
- **图片**：本项目 Hero/人物使用内联 SVG 插画，未引入外部图片；若后续引入真实摄影，`alt` 必填、装饰图 `alt=""`。

## 老年友好模式

三种模式通过 `<html>` 上的 class 控制（见 `a11y-provider.tsx`）：
- `normal`：默认
- `senior-mode`：字号 ×1.2、按钮加大、可关闭动画
- `high-contrast`：白底黑字、描边加深、阴影转描边

状态持久化在 `localStorage['dachun-a11y-mode']`。

## Hydration 注意事项

- `A11yProvider` 用 `useEffect` + `useState` 避免 SSR 与客户端 class 不一致。
- 不要在 JSX 中直接使用 `Date.now()` / `Math.random()` / `typeof window`。
- 禁止在 `app/` 下用 `<head>`，三方资源使用 `metadata` 或 `globals.css` 的 `@import`。

## 联系信息（站点统一常量）

- 助老热线：`400-610-0808`
- 邮箱：`care@dachun-elder.com`
- 地址：北京市朝阳区幸福里社区服务中心 3 层

修改联系方式时全局搜索上述常量即可。
