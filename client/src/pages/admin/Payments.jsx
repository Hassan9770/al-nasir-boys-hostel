import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg } from '../../services/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Badge, Field, Load, Modal, PageHeader, Pager, Table, usePageMeta } from '../../components/ui.jsx';
import { money, month, label, today, thisMonth } from '../../utils/format.js';

function RecordModal({ initial = {}, onClose, onDone }) {
  const { settings: s } = useSettings(); const users = useFetch('/admin/users?limit=100'); const [detail, setDetail] = useState(null); const [busy, setBusy] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ defaultValues: { type: 'rent', billingMonth: thisMonth(), paymentDate: today(), method: 'Cash', ...initial } });
  const uid = watch('userId'); const type = watch('type');
  useEffect(() => { if (!uid) return setDetail(null); api.get(`/admin/users/${uid}`).then((r) => setDetail(r.data)).catch(() => setDetail(null)); }, [uid]);
  const links = type === 'rent' ? (detail?.bookings || []).filter((b) => ['approved', 'checked_in', 'completed'].includes(b.status)) : (detail?.subscriptions || []).filter((x) => ['active', 'expired'].includes(x.status));
  const pickLink = (e) => { const l = links.find((x) => x._id === e.target.value); if (l) setValue('amountDue', type === 'rent' ? l.room?.monthlyRent : l.monthlyPrice); };
  const submit = async (v) => {
    setBusy(true);
    try { const body = { ...v, bookingId: type === 'rent' ? v.link : '', subscriptionId: type === 'mess' ? v.link : '' }; delete body.link; if (body.amountDue === '' || body.amountDue === undefined) delete body.amountDue; await api.post('/admin/payments', body); toast.success('Payment recorded'); onDone(); onClose(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Modal title="Record payment received" onClose={onClose} wide>
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2"><Field label="Resident / customer" error={errors.userId}><select className="input" {...register('userId', { required: 'Select a resident' })}><option value="">Select…</option>{users.data?.items.map((u) => <option key={u._id} value={u._id}>{u.name} — {u.phone}</option>)}</select></Field></div>
        <Field label="Payment for"><select className="input" {...register('type')}><option value="rent">Room rent</option><option value="mess">Mess</option></select></Field>
        <Field label="Billing month"><input type="month" className="input" {...register('billingMonth', { required: true })} /></Field>
        <div className="sm:col-span-2"><Field label={type === 'rent' ? 'Linked booking' : 'Linked subscription'} hint="Selecting one fills the amount due automatically."><select className="input" {...register('link', { onChange: pickLink })}><option value="">None</option>{links.map((l) => <option key={l._id} value={l._id}>{type === 'rent' ? `Room ${l.room?.roomNumber} (${l.status})` : `${l.plan?.name} (${l.status})`}</option>)}</select></Field></div>
        <Field label="Amount due for this month (PKR)" hint="Required for a new entry"><input type="number" min="0" step="any" className="input" {...register('amountDue')} /></Field>
        <Field label="Amount received now (PKR)" error={errors.amountPaid}><input type="number" min="1" step="any" className="input" {...register('amountPaid', { required: 'Enter the amount received', min: { value: 1, message: 'Must be above zero' } })} /></Field>
        <Field label="Payment date" error={errors.paymentDate}><input type="date" className="input" {...register('paymentDate', { required: 'Required' })} /></Field>
        <Field label="Method"><select className="input" {...register('method')}>{(s?.payment?.methods?.length ? s.payment.methods : ['Cash', 'Bank Transfer']).map((m) => <option key={m}>{m}</option>)}</select></Field>
        <Field label="Reference (optional)"><input className="input" {...register('reference')} /></Field>
        <Field label="Note (optional)"><input className="input" {...register('note')} /></Field>
        <div className="sm:col-span-2"><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Record payment'}</button></div>
      </form>
    </Modal>
  );
}
export default function Payments({ mess }) {
  usePageMeta(mess ? 'Mess Payments' : 'Rent & Payments'); const [f, setF] = useState({ type: mess ? 'mess' : 'rent', status: '', billingMonth: '', page: 1 }); const [rec, setRec] = useState(null);
  useEffect(() => setF((x) => ({ ...x, type: mess ? 'mess' : 'rent', page: 1 })), [mess]);
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v !== '' && v !== 1)).toString();
  const state = useFetch('/admin/payments?' + qs); const d = state.data;
  const gen = async () => { const bm = f.billingMonth || thisMonth(); if (!confirm(`Create unpaid billing entries for ${month(bm)} for all current residents/subscribers?`)) return; try { const r = await api.post('/admin/payments/generate', { billingMonth: bm }); toast.success(r.data.message); state.reload(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <>
      <PageHeader title={mess ? 'Mess payments' : 'Monthly rent & payments'} sub="Records of money received by the hostel. Nothing is marked paid automatically.">
        <div className="flex gap-2"><button className="btn-outline" onClick={gen}>Generate monthly dues</button><button className="btn-primary" onClick={() => setRec({ type: f.type })}>Record payment</button></div></PageHeader>
      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-3">
        <select className="input" aria-label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value, page: 1 })}><option value="">All statuses</option>{['unpaid', 'partial', 'paid'].map((s) => <option key={s}>{s}</option>)}</select>
        <input type="month" className="input" aria-label="Billing month" value={f.billingMonth} onChange={(e) => setF({ ...f, billingMonth: e.target.value, page: 1 })} />
        <button className="btn-outline" onClick={() => setF({ type: f.type, status: '', billingMonth: '', page: 1 })}>Clear filters</button>
      </div>
      <Load state={state} empty={d?.items.length === 0 && 'No records match.'}>
        <Table head={['Month', 'Resident', 'Type', 'Due', 'Paid', 'Balance', 'Status', '']}>{d?.items.map((p) => (
          <tr key={p._id}><td className="td">{month(p.billingMonth)}</td><td className="td"><b>{p.user?.name}</b><br /><span className="text-xs text-slate-500">{p.user?.phone}</span></td><td className="td">{label(p.type)}</td><td className="td">{money(p.amountDue)}</td><td className="td">{money(p.amountPaid)}</td><td className="td">{money(p.balance)}</td><td className="td"><Badge value={p.status} /></td>
            <td className="td whitespace-nowrap"><button className="btn-outline btn-sm mr-2" onClick={() => setRec({ userId: p.user?._id, type: p.type, billingMonth: p.billingMonth, link: p.booking || p.subscription || '', amountDue: p.amountDue })}>Add payment</button>{p.transactions.length > 0 && <Link className="font-semibold text-navy-700 underline" to={`/admin/receipt/${p._id}`}>Receipt</Link>}</td></tr>))}</Table>
        <Pager data={d} onPage={(page) => setF({ ...f, page })} />
      </Load>
      {rec && <RecordModal initial={rec} onClose={() => setRec(null)} onDone={state.reload} />}
    </>
  );
}
