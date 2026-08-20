/**
 * 服务端验证码存储（开发阶段内存实现）
 *
 * ⚠️ TODO(生产环境):
 *   - 接入真实短信服务商（阿里云/腾讯云 SMS）
 *   - 验证码写入 Redis，设置 5 分钟 TTL，验证一次后立即删除
 *   - 增加同一手机号 60 秒发送频控与每日发送次数限制
 *   - 增加 IP 维度限流，防止短信轰炸
 */

interface CodeRecord {
  code: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}

const store = new Map<string, CodeRecord>();

// 开发阶段固定验证码
export const DEV_FIXED_CODE = '123456';
const CODE_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

export function canSendCode(phone: string): { ok: boolean; retryAfter?: number } {
  const rec = store.get(phone);
  if (!rec) return { ok: true };
  const elapsed = Date.now() - rec.lastSentAt;
  if (elapsed < RESEND_COOLDOWN_MS) {
    return { ok: false, retryAfter: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000) };
  }
  return { ok: true };
}

export function issueCode(phone: string): string {
  // 开发阶段直接返回固定码，生产环境替换为随机 6 位并调用短信 API
  const code = DEV_FIXED_CODE;
  store.set(phone, {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    lastSentAt: Date.now(),
    attempts: 0,
  });
  return code;
}

export function verifyCode(phone: string, input: string): { ok: boolean; reason?: string } {
  const rec = store.get(phone);
  if (!rec) return { ok: false, reason: '请先获取验证码' };
  if (Date.now() > rec.expiresAt) {
    store.delete(phone);
    return { ok: false, reason: '验证码已过期，请重新获取' };
  }
  if (rec.attempts >= MAX_VERIFY_ATTEMPTS) {
    store.delete(phone);
    return { ok: false, reason: '验证错误次数过多，请重新获取' };
  }
  if (input.trim() !== rec.code) {
    rec.attempts += 1;
    return { ok: false, reason: '验证码不正确' };
  }
  // 验证成功后立即失效（一次性使用）
  store.delete(phone);
  return { ok: true };
}
