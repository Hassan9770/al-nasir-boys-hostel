import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg, img } from '../../services/api.js';
import EditForm from '../../components/EditForm.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';
import { Badge, Load, Modal, PageHeader, Pager, Table, usePageMeta } from '../../components/ui.jsx';
import { date, money, label } from '../../utils/format.js';

const PLAN_FIELDS = [
  { name: 'name', label: 'Plan name', required: true }, { name: 'monthlyPrice', label: 'Monthly price (PKR)', type: 'number', required: true },
  { name: 'mealsPerDay', label: 'Meals per day', type: 'number', required: true }, { name: 'includedMeals', label: 'Included meals (e.g. Lunch & dinner)' },
  { name: 'timings', label: 'Meal timings', span: 2 }, { name: 'menu', label: 'Menu', type: 'textarea' }, { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'diningOption', label: 'Service type', type: 'select', options: [{ value: 'both', label: 'Dine at hostel or collect' }, { value: 'dine_in', label: 'Dine at hostel only' }, { value: 'takeaway', label: 'Collection / takeaway only' }] },
  { name: 'active', label: 'Plan is active (visible to public)', type: 'checkbox' }
];
function Plans() {
  const state = useFetch('/admin/mess/plans'); const [edit, setEdit] = useState(null); const [menuImage, setMenuImage] = useState(''); const [busy, setBusy] = useState(false);
  const open = (p) => { setEdit(p || {}); setMenuImage(p?.menuImage || ''); };
  const save = async (v) => { setBusy(true); try { const body = { ...v, menuImage }; if (edit._id) await api.put(`/admin/mess/plans/${edit._id}`, body); else await api.post('/admin/mess/plans', body); toast.success('Plan saved'); setEdit(null); state.reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  const del = async (p) => { if (!confirm(`Delete plan "${p.name}"?`)) return; try { await api.delete(`/admin/mess/plans/${p._id}`); toast.success('Deleted'); state.reload(); } catch (e) { toast.error(errMsg(e)); } };
  const items = state.data?.items || [];
  return (
    <>
      <div className="mb-3 flex justify-end"><button className="btn-primary" onClick={() => open()}>Add meal plan</button></div>
      <Load state={state} empty={items.length === 0 && 'No meal plans yet.'}>
        <Table head={['Plan', 'Price', 'Meals/day', 'Timings', 'Service', 'Status', '']}>{items.map((p) => (
          <tr key={p._id}><td className="td font-semibold">{p.name}</td><td className="td">{money(p.monthlyPrice)}</td><td className="td">{p.mealsPerDay}</td><td className="td">{p.timings || '—'}</td><td className="td">{label(p.diningOption)}</td><td className="td"><Badge value={p.active ? 'active' : 'cancelled'} /></td>
            <td className="td whitespace-nowrap"><button className="btn-outline btn-sm mr-2" onClick={() => open(p)}>Edit</button><button className="btn btn-sm text-red-700 hover:bg-red-50" onClick={() => del(p)}>Delete</button></td></tr>))}</Table>
      </Load>
      {edit && <Modal title={edit._id ? 'Edit meal plan' : 'Add meal plan'} onClose={() => setEdit(null)} wide>
        <EditForm fields={PLAN_FIELDS} initial={{ mealsPerDay: 2, diningOption: 'both', active: true, ...edit }} onSubmit={save} busy={busy}>
          <div className="sm:col-span-2"><span className="label">Menu photo (optional)</span><div className="flex items-center gap-3">{menuImage && <img src={img(menuImage)} alt="" className="h-16 w-24 rounded object-cover" />}<ImageUpload label="Upload menu photo" onUploaded={setMenuImage} />{menuImage && <button type="button" className="text-sm underline" onClick={() => setMenuImage('')}>Remove</button>}</div></div>
        </EditForm></Modal>}
    </>
  );
}
function Subs({ type }) {
  const [f, setF] = useState({ status: '', page: 1 });
  const qs = new URLSearchParams(Object.entries({ ...f, customerType: type }).filter(([, v]) => v !== '' && v !== 1)).toString();
  const state = useFetch('/admin/mess/subscriptions?' + qs); const d = state.data;
  const set = async (s, status) => { const adminNote = ['rejected', 'cancelled'].includes(status) ? prompt('Optional note for the customer:') ?? undefined : undefined; if (['rejected', 'cancelled'].includes(status) && adminNote === undefined) return; try { await api.patch(`/admin/mess/subscriptions/${s._id}/status`, { status, adminNote }); toast.success('Updated'); state.reload(); } catch (e) { toast.error(errMsg(e)); } };
  const acts = (s) => ({ pending: [['active', 'Approve', 'btn-primary'], ['rejected', 'Reject', 'btn-danger']], active: [['expired', 'Mark expired', 'btn-outline'], ['cancelled', 'Cancel', 'btn-outline']] }[s.status] || []);
  return (
    <>
      <div className="card mb-4 p-4"><select className="input max-w-xs" aria-label="Status" value={f.status} onChange={(e) => setF({ status: e.target.value, page: 1 })}><option value="">All statuses</option>{['pending', 'active', 'expired', 'cancelled', 'rejected'].map((s) => <option key={s}>{s}</option>)}</select></div>
      <Load state={state} empty={d?.items.length === 0 && 'No subscriptions.'}>
        <Table head={['Customer', 'Plan', 'Meals/day', 'Period', 'Arrangement', 'Status', 'Actions']}>{d?.items.map((s) => (
          <tr key={s._id}><td className="td"><b>{s.user?.name}</b><br /><span className="text-xs text-slate-500">{s.user?.phone}</span></td><td className="td">{s.plan?.name}<br /><span className="text-xs">{money(s.monthlyPrice)}/mo</span></td><td className="td">{s.mealsPerDay}</td><td className="td">{date(s.startDate)} – {date(s.endDate)}</td><td className="td">{label(s.arrangement) || '—'}{s.notes && <div className="text-xs text-slate-500">{s.notes}</div>}</td>
            <td className="td"><Badge value={s.status} />{s.cancellationRequested && <div className="mt-1 text-xs font-semibold text-amber-700">Cancellation requested</div>}</td><td className="td"><div className="flex flex-wrap gap-1">{acts(s).map(([st, l, c]) => <button key={st} className={`${c} btn-sm`} onClick={() => set(s, st)}>{l}</button>)}</div></td></tr>))}</Table>
        <Pager data={d} onPage={(page) => setF({ ...f, page })} />
      </Load>
    </>
  );
}
export default function Mess() {
  usePageMeta('Mess Management'); const [tab, setTab] = useState('plans');
  const tabs = [['plans', 'Mess plans'], ['hostel_resident', 'Resident subscriptions'], ['external', 'External customers'], ['all', 'All subscriptions']];
  return (
    <>
      <PageHeader title="Mess management" sub="Meal plans and subscriptions are separate from room bookings. Record mess payments under Mess Payments." />
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">{tabs.map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === k ? 'bg-navy-800 text-white' : 'bg-white text-navy-800 ring-1 ring-slate-200'}`}>{t}</button>)}</div>
      {tab === 'plans' ? <Plans /> : <Subs key={tab} type={tab === 'all' ? '' : tab} />}
    </>
  );
}
