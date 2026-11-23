import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api.js';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [pending, setPending] = useState([]); const [ready, setReady] = useState(false);
  const apply = (d) => { setUser(d.user || null); setPending(d.pendingPolicies || []); return d.user; };
  const refresh = useCallback(() => api.get('/auth/me').then((r) => apply(r.data)).catch(() => apply({})).finally(() => setReady(true)), []);
  useEffect(() => { refresh(); }, [refresh]);
  const login = async (v) => apply((await api.post('/auth/login', v)).data);
  const register = async (v) => apply((await api.post('/auth/register', v)).data);
  const logout = async () => { await api.post('/auth/logout').catch(() => {}); apply({}); };
  const accept = async () => { await api.post('/auth/accept-terms'); setPending([]); };
  return <Ctx.Provider value={{ user, pending, ready, login, register, logout, refresh, accept, setUser, isAdmin: user?.role === 'admin' }}>{children}</Ctx.Provider>;
}
