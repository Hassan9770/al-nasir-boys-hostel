import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../services/api.js';
export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true); setError('');
    try { setData((await api.get(url)).data); } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }, [url]); // eslint-disable-line
  useEffect(() => { load(); }, [load, ...deps]); // eslint-disable-line
  return { data, loading, error, reload: load };
}
