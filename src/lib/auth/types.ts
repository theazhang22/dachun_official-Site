export interface PublicUser {
  id: string;
  phone: string;
  nickname: string;
  avatar_url: string | null;
  total_score: number;
  rank_title: string;
}

export interface UserStats {
  total_answered: number;
  total_correct: number;
  total_score: number;
  rank_title: string;
}

export const PHONE_REGEX = /^1[3-9]\d{9}$/;
// 至少 6 位，必须同时包含字母与数字
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,32}$/;

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
