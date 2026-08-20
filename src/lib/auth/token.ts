/**
 * 简易 Token（开发阶段使用）
 *
 * 格式：base64url(JSON({ uid, iat, exp }))
 *   - uid: 用户 id (uuid)
 *   - iat: 签发时间（毫秒）
 *   - exp: 过期时间（毫秒）
 *
 * ⚠️ TODO(生产环境):
 *   - 替换为标准 JWT（使用 jsonwebtoken + HS256/RS256 + 环境变量 secret）
 *   - 增加签名校验，防止客户端伪造
 *   - 接入 refresh token 与服务端黑名单（登出失效）
 */

const TOKEN_NAME = 'dachun_token';
const REMEMBER_NAME = 'dachun_remember';

export interface TokenPayload {
  uid: string;
  iat: number;
  exp: number;
}

function encodeBase64Url(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeBase64Url(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString(
    'utf8',
  );
}

export function signToken(uid: string, opts?: { rememberMe?: boolean }): string {
  const now = Date.now();
  // 默认 1 天，记住我 30 天
  const ttl = opts?.rememberMe ? 30 * 24 * 3600 * 1000 : 24 * 3600 * 1000;
  const payload: TokenPayload = { uid, iat: now, exp: now + ttl };
  return encodeBase64Url(JSON.stringify(payload));
}

export function verifyToken(token: string | null | undefined): TokenPayload | null {
  if (!token) return null;
  try {
    const obj = JSON.parse(decodeBase64Url(token)) as TokenPayload;
    if (!obj.uid || typeof obj.exp !== 'number') return null;
    if (Date.now() > obj.exp) return null;
    return obj;
  } catch {
    return null;
  }
}

export function saveToken(token: string, rememberMe: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_NAME, token);
  if (rememberMe) {
    window.localStorage.setItem(REMEMBER_NAME, '1');
  } else {
    window.localStorage.removeItem(REMEMBER_NAME);
  }
}

export function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_NAME);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_NAME);
  window.localStorage.removeItem(REMEMBER_NAME);
}
