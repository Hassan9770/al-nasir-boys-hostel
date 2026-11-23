import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api.js';
export default function ImageUpload({ onUploaded, label = 'Upload image' }) {
  const ref = useRef(); const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error('Image must be 3 MB or smaller');
    const fd = new FormData(); fd.append('image', file); setBusy(true);
    try { const r = await api.post('/admin/upload', fd); onUploaded(r.data.url); toast.success('Image uploaded'); } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); ref.current.value = ''; }
  };
  return <><input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} /><button type="button" className="btn-outline btn-sm" disabled={busy} onClick={() => ref.current.click()}><Upload className="h-4 w-4" />{busy ? 'Uploading…' : label}</button></>;
}
