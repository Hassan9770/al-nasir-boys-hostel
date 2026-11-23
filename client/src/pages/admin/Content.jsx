import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg, img } from '../../services/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import EditForm from '../../components/EditForm.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';
import { Load, Modal, PageHeader, Table, Badge, Empty, usePageMeta } from '../../components/ui.jsx';

const CATS = ['Exterior', 'Bedrooms', 'Washrooms', 'Study Areas', 'Dining & Mess', 'Common Areas', 'Other'];
const pairs = (arr, a, b) => (arr || []).map((x) => `${x[a]} | ${x[b]}`).join('\n');
const parse = (t, a, b) => String(t || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [x, ...y] = l.split('|'); return { [a]: x.trim(), [b]: y.join('|').trim() }; });

function SettingsTab() {
  const { settings: s, reload } = useSettings(); const [busy, setBusy] = useState(false); const [hero, setHero] = useState(s.heroImage || '');
  const F = [
    { name: 'hostelName', label: 'Hostel name', required: true }, { name: 'tagline', label: 'Hero heading' }, { name: 'description', label: 'Hostel description', type: 'textarea' }, { name: 'mission', label: 'Mission', type: 'textarea' }, { name: 'vision', label: 'Vision', type: 'textarea' }, { name: 'messIntro', label: 'Mess page introduction', type: 'textarea' },
    { name: 'phone', label: 'Phone' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'address', label: 'Full address', span: 2 }, { name: 'officeHours', label: 'Office hours', span: 2 },
    { name: 'whatsappNumber', label: 'WhatsApp number', hint: 'Digits only with country code, e.g. 923001234567' }, { name: 'whatsappMessage', label: 'Prefilled WhatsApp message' },
    { name: 'mapLink', label: 'Google Maps link' }, { name: 'mapEmbedUrl', label: 'Google Maps embed URL', hint: 'Maps → Share → Embed a map → copy the src="…" URL' },
    { name: 'facebook', label: 'Facebook URL' }, { name: 'instagram', label: 'Instagram URL' }, { name: 'youtube', label: 'YouTube URL' }, { name: 'tiktok', label: 'TikTok URL' },
    { name: 'rentDueDay', label: 'Rent due day of month (1–28)', type: 'number' }, { name: 'messDays', label: 'Mess payment deadline (days after start)', type: 'number' }, { name: 'methods', label: 'Payment methods', type: 'list', hint: 'Comma separated, e.g. Cash, Bank Transfer', span: 2 },
    { name: 'why', label: 'Why choose us (one per line: Title | text)', type: 'textarea' }, { name: 'faqs', label: 'FAQs (one per line: Question | answer)', type: 'textarea' }
  ];
  const init = { ...s, ...s.social, rentDueDay: s.payment?.rentDueDay, messDays: s.payment?.messPaymentDeadlineDays, methods: (s.payment?.methods || []).join(', '), why: pairs(s.whyChooseUs, 'title', 'text'), faqs: pairs(s.faqs, 'q', 'a') };
  const save = async (v) => {
    setBusy(true);
    try {
      const body = { hostelName: v.hostelName, tagline: v.tagline, description: v.description, mission: v.mission, vision: v.vision, messIntro: v.messIntro, phone: v.phone, email: v.email, address: v.address, officeHours: v.officeHours, whatsappNumber: v.whatsappNumber, whatsappMessage: v.whatsappMessage, mapLink: v.mapLink, mapEmbedUrl: v.mapEmbedUrl, heroImage: hero,
        social: { facebook: v.facebook, instagram: v.instagram, youtube: v.youtube, tiktok: v.tiktok }, whyChooseUs: parse(v.why, 'title', 'text'), faqs: parse(v.faqs, 'q', 'a'),
        payment: { rentDueDay: v.rentDueDay || 5, messPaymentDeadlineDays: v.messDays ?? 5, methods: v.methods } };
      await api.put('/admin/settings', body); toast.success('Website content updated'); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return <div className="card p-5"><EditForm fields={F} initial={init} onSubmit={save} busy={busy}><div className="sm:col-span-2"><span className="label">Hero background image (optional)</span><div className="flex items-center gap-3">{hero && <img src={img(hero)} alt="" className="h-16 w-28 rounded object-cover" />}<ImageUpload label="Upload image" onUploaded={setHero} />{hero && <button type="button" className="text-sm underline" onClick={() => setHero('')}>Remove</button>}</div></div></EditForm></div>;
}
function FacilityEditor({ reload }) {
  const [list, setList] = useState(null); const [busy, setBusy] = useState(false); const [name, setName] = useState('');
  useEffect(() => { api.get('/admin/facilities').then((r) => setList(r.data.items)).catch((e) => toast.error(errMsg(e))); }, []);
  if (!list) return <div className="py-8 text-center">Loading…</div>;
  const upd = (i, patch) => setList(list.map((f, k) => (k === i ? { ...f, ...patch } : f)));
  const save = async () => { setBusy(true); try { await api.put('/admin/settings', { facilities: list }); toast.success('Facilities saved'); reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  return (
    <div className="card p-5"><p className="mb-3 text-sm text-slate-600">Only enabled facilities appear on the public website. Enable a facility only if the hostel really provides it.</p>
      <div className="space-y-3">{list.map((f, i) => <div key={f.key + i} className="grid items-center gap-2 border-b pb-3 sm:grid-cols-[auto_1fr_2fr_auto]"><label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={f.enabled} onChange={(e) => upd(i, { enabled: e.target.checked })} aria-label={`Enable ${f.name}`} /></label><input className="input" value={f.name} onChange={(e) => upd(i, { name: e.target.value })} aria-label="Name" /><input className="input" value={f.description || ''} onChange={(e) => upd(i, { description: e.target.value })} aria-label="Description" /><button className="btn btn-sm text-red-700" onClick={() => setList(list.filter((_, k) => k !== i))}>Remove</button></div>)}</div>
      <div className="mt-4 flex flex-wrap gap-2"><input className="input max-w-xs" placeholder="New facility name" value={name} onChange={(e) => setName(e.target.value)} /><button className="btn-outline" onClick={() => { if (!name.trim()) return; setList([...list, { key: 'custom-' + Date.now(), name: name.trim(), description: '', icon: 'CheckCircle2', enabled: false }]); setName(''); }}>Add facility</button><button className="btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save facilities'}</button></div></div>
  );
}
function Testimonials() {
  const state = useFetch('/admin/testimonials'); const [edit, setEdit] = useState(null); const [busy, setBusy] = useState(false);
  const F = [{ name: 'displayName', label: 'Display name', required: true }, { name: 'role', label: 'Role (e.g. Student)' }, { name: 'rating', label: 'Rating (1–5)', type: 'number' }, { name: 'message', label: 'Message', type: 'textarea', required: true }, { name: 'approved', label: 'Approved (show on website)', type: 'checkbox' }];
  const save = async (v) => { setBusy(true); try { if (edit._id) await api.put(`/admin/testimonials/${edit._id}`, v); else await api.post('/admin/testimonials', v); toast.success('Saved'); setEdit(null); state.reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  const del = async (t) => { if (!confirm('Delete?')) return; await api.delete(`/admin/testimonials/${t._id}`).catch((e) => toast.error(errMsg(e))); state.reload(); };
  const items = state.data?.items || [];
  return (<><div className="mb-3 flex justify-between"><p className="text-sm text-slate-600">Add only real feedback you have permission to publish.</p><button className="btn-primary" onClick={() => setEdit({ rating: 5, approved: true })}>Add testimonial</button></div>
    <Load state={state} empty={items.length === 0 && 'No testimonials yet.'}><Table head={['Name', 'Message', 'Rating', 'Status', '']}>{items.map((t) => <tr key={t._id}><td className="td font-semibold">{t.displayName}</td><td className="td max-w-xs">{t.message}</td><td className="td">{t.rating}★</td><td className="td"><Badge value={t.approved ? 'approved' : 'pending'} /></td><td className="td whitespace-nowrap"><button className="btn-outline btn-sm mr-2" onClick={() => setEdit(t)}>Edit</button><button className="btn btn-sm text-red-700" onClick={() => del(t)}>Delete</button></td></tr>)}</Table></Load>
    {edit && <Modal title="Testimonial" onClose={() => setEdit(null)}><EditForm fields={F} initial={edit} onSubmit={save} busy={busy} /></Modal>}</>);
}
function Gallery() {
  const state = useFetch('/admin/gallery'); const [cat, setCat] = useState('Bedrooms'); const [title, setTitle] = useState('');
  const add = async (url) => { try { await api.post('/admin/gallery', { url, title, category: cat, active: true }); setTitle(''); state.reload(); } catch (e) { toast.error(errMsg(e)); } };
  const toggle = async (g) => { await api.put(`/admin/gallery/${g._id}`, { url: g.url, title: g.title, category: g.category, active: !g.active }).catch((e) => toast.error(errMsg(e))); state.reload(); };
  const del = async (g) => { if (!confirm('Delete this image?')) return; await api.delete(`/admin/gallery/${g._id}`).catch((e) => toast.error(errMsg(e))); state.reload(); };
  const items = state.data?.items || [];
  return (<><div className="card mb-4 flex flex-wrap items-end gap-3 p-4"><div><label className="label">Category</label><select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div><div><label className="label">Title (optional)</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div><ImageUpload label="Upload photo" onUploaded={add} /></div>
    <Load state={state} empty={items.length === 0 && 'No gallery photos yet.'}><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{items.map((g) => <figure key={g._id} className="card overflow-hidden"><img src={img(g.url)} alt={g.title || g.category} className={`aspect-square w-full object-cover ${g.active ? '' : 'opacity-40'}`} loading="lazy" /><figcaption className="p-2 text-xs"><div className="font-semibold">{g.title || g.category}</div><div className="mt-1 flex gap-2"><button className="underline" onClick={() => toggle(g)}>{g.active ? 'Hide' : 'Show'}</button><button className="text-red-700 underline" onClick={() => del(g)}>Delete</button></div></figcaption></figure>)}</div></Load></>);
}
export default function Content() {
  usePageMeta('Website Content'); const { settings, reload } = useSettings(); const [tab, setTab] = useState('settings');
  const tabs = [['settings', 'Hostel info & contact'], ['facilities', 'Facilities'], ['testimonials', 'Testimonials'], ['gallery', 'Gallery']];
  return (
    <>
      <PageHeader title="Website content" sub="Everything shown on the public website is managed here." />
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">{tabs.map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === k ? 'bg-navy-800 text-white' : 'bg-white text-navy-800 ring-1 ring-slate-200'}`}>{t}</button>)}</div>
      {tab === 'settings' && settings && <SettingsTab />}{tab === 'facilities' && <FacilityEditor reload={reload} />}{tab === 'testimonials' && <Testimonials />}{tab === 'gallery' && <Gallery />}
    </>
  );
}
