'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { clearToken, readToken, saveToken } from '@/lib/auth/token';
import type { PublicUser } from '@/lib/auth/types';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  isAuthed: boolean;
  refresh: () => Promise<void>;
  signIn: (token: string, user: PublicUser, rememberMe?: boolean) => void;
  signOut: () => void;
  updateUser: (patch: Partial<PublicUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = readToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        clearToken();
        setUser(null);
        return;
      }
      const json = (await res.json()) as { user: PublicUser };
      setUser(json.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(
    (token: string, u: PublicUser, rememberMe = false) => {
      saveToken(token, rememberMe);
      setUser(u);
    },
    [],
  );

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
    router.refresh();
  }, [router]);

  const updateUser = useCallback((patch: Partial<PublicUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthed: !!user,
      refresh,
      signIn,
      signOut,
      updateUser,
    }),
    [user, loading, refresh, signIn, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return ctx;
}
