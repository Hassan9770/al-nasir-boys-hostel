import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg } from '../../services/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Badge, Load, PageHeader, Pager, usePageMeta } from '../../components/ui.jsx';
import { date, waLink } from '../../utils/format.js';
function Item({ c, reload }) {
  const [reply, setReply] = useState(c.adminReply || '');
  const save = async (patch) => { try { await api.patch(`/admin/contacts/${c._id}`, patch); toast.success('Saved'); reload(); } catch (e) { toast.error(errMsg(e)); } };
  const del = async () => { if (!confirm('Delete this enquiry?')) return; try { await api.delete(`/admin/contacts/${c._id}`); reload(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <article className="card p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><b>{c.name}</b> <span className="text-sm text-slate-500">· {c.phone}{c.email && ` · ${c.email}`} · {date(c.createdAt)}</span></div><Badge value={c.status} /></div>
      <p className="mt-2 whitespace-pre-line text-sm">{c.message}</p>
      <textarea className="input mt-3" rows={2} placeholder="Internal note / reply summary" value={reply} onChange={(e) => setReply(e.target.value)} />
      <div className="mt-2 flex flex-wrap gap-2"><button className="btn-primary btn-sm" onClick={() => save({ adminReply: reply })}>Save note</button>
        {c.status !== 'in_progress' && <button className="btn-outline btn-sm" onClick={() => save({ status: 'in_progress' })}>Mark in progress</button>}{c.status !== 'resolved' && <button className="btn-outline btn-sm" onClick={() => save({ status: 'resolved' })}>Mark resolved</button>}
        <a className="btn-outline btn-sm" target="_blank" rel="noopener noreferrer" href={waLink(c.phone, `Hello ${c.name}, this is AL NASIR BOYS HOSTEL replying to your enquiry.`)}>Reply on WhatsApp</a>{c.email && <a className="btn-outline btn-sm" href={`mailto:${c.email}?subject=Your enquiry at AL NASIR BOYS HOSTEL`}>Reply by email</a>}
        <button className="btn btn-sm text-red-700" onClick={del}>Delete</button></div></article>
  );
}
export default function Contacts() {
  usePageMeta('Enquiries'); const [f, setF] = useState({ status: '', page: 1 });
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v !== '' && v !== 1)).toString();
  const state = useFetch('/admin/contacts' + (qs ? '?' + qs : '')); const d = state.data; useSettings();
  return (
    <>
      <PageHeader title="Contact enquiries" />
      <div className="card mb-4 p-4"><select className="input max-w-xs" aria-label="Status" value={f.status} onChange={(e) => setF({ status: e.target.value, page: 1 })}><option value="">All</option><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></div>
      <Load state={state} empty={d?.items.length === 0 && 'No enquiries.'}><div className="space-y-3">{d?.items.map((c) => <Item key={c._id + c.updatedAt} c={c} reload={state.reload} />)}</div><Pager data={d} onPage={(page) => setF({ ...f, page })} /></Load>
    </>
  );
}
