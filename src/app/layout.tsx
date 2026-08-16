import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { BackToTop } from '@/components/a11y/back-to-top';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '大椿助老 | 社区嵌入式养老服务 · 您家门口的养老管家',
    template: '%s | 大椿助老',
  },
  description:
    '大椿助老扎根社区，为 60+ 长辈提供助餐助浴、陪同就医、康复护理、日间照料、心理慰藉等 30+ 项专业服务。24 小时响应、持证护理、家属手机可视。助老热线 18664353853。',
  keywords: [
    '大椿助老',
    '社区养老',
    '居家养老',
    '助餐助浴',
    '陪同就医',
    '康复护理',
    '日间照料',
    '老年护理',
    '北京养老服务',
    '养老管家',
  ],
  authors: [{ name: '大椿助老' }],
  openGraph: {
    title: '大椿助老 | 让每一位长辈在熟悉的社区里安享晚年',
    description:
      '社区嵌入式助老服务，助餐助浴、陪同就医、康复护理、24 小时响应。持证护理员，家属手机可看。',
    locale: 'zh_CN',
    type: 'website',
    siteName: '大椿助老',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <Inspector />
        <Header />
        {children}
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
