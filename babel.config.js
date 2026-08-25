// Babel 配置：调试插件（react-dev-inspector）仅在开发环境启用，
// 生产构建（如 Vercel）完全不加载它，避免 dev 工具导致的构建失败。
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  presets: [
    [
      'next/babel',
      isDev ? { 'preset-react': { development: true } } : {},
    ],
  ],
  plugins: isDev ? ['@react-dev-inspector/babel-plugin'] : [],
};
