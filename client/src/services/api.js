import axios from 'axios';
const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || '') + '/api', withCredentials: true, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
export const errMsg = (e) => e?.response?.data?.message || (e?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Check that the backend is running.' : 'Something went wrong');
export const img = (u) => (!u ? '' : /^https?:/.test(u) ? u : (import.meta.env.VITE_API_URL || '') + u);
export default api;
