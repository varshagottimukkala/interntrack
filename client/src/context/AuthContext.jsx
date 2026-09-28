import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'interntrack_token';
const USER_KEY = 'interntrack_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [booting, setBooting] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  function persist(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    if (nextUser && nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const data = await api('/api/auth/me', { token });
        if (!cancelled) persist(data.user, token);
      } catch {
        if (!cancelled) persist(null, '');
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      async signup(payload) {
        const data = await api('/api/auth/register', { method: 'POST', body: payload });
        persist(data.user, data.token);
        return data.user;
      },
      async login(payload) {
        const data = await api('/api/auth/login', { method: 'POST', body: payload });
        persist(data.user, data.token);
        return data.user;
      },
      logout() {
        persist(null, '');
      },
    }),
    [user, token, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
