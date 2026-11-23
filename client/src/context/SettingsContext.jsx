import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';
const Ctx = createContext({ settings: null, reload: () => {} });
export const useSettings = () => useContext(Ctx);
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const reload = () => api.get('/public/settings').then((r) => setSettings(r.data.settings)).catch(() => setSettings({ hostelName: 'AL NASIR BOYS HOSTEL', facilities: [], offline: true }));
  useEffect(() => { reload(); }, []);
  return <Ctx.Provider value={{ settings, reload }}>{children}</Ctx.Provider>;
}
