import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg } from '../../services/api.js';
import { Badge, Load, Modal, PageHeader, Pager, Table, usePageMeta } from '../../components/ui.jsx';
import { date, money, month, label } from '../../utils/format.js';
const CATS = ['Student', 'Job Holder / Employee', 'Labour Worker', 'Business Owner / Self-Employed', 'Other', 'Mess Customer Only'];
function Detail({ id, onClose, onChange }) {
  const state = useFetch(`/admin/users/${id}`); const { user: u, bookings = [], payments = [], subscriptions = [] } = state.data || {};
  const toggle = async () => { try { await api.patch(`/admin/users/${id}`, { active: !u.active }); toast.success(u.active ? 'Account deactivated' : 'Account activated'); state.reload(); onChange(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <Modal title="Resident profile" onClose={onClose} wide><Load state={state}>{u && <div className="space-y-5 text-sm">
      <div className="grid gap-2 sm:grid-cols-2"><div><b>{u.name}</b> <Badge value={u.active ? 'active' : 'cancelled'} tone={u.active ? 'green' : 'red'} /></div><div>{u.email}</div><div>Phone: {u.phone}</div><div>Category: {u.residentCategory}</div>
        {[['Institution', u.institution], ['Course', u.course], ['Company', u.company], ['Designation', u.designation], ['Employer', u.employer], ['Purpose', u.purposeOfStay], ['Emergency contact', [u.emergencyName, u.emergencyPhone].filter(Boolean).join(' · ')]].filter(([, v]) => v).map(([k, v]) => <div key={k}>{k}: {v}</div>)}</div>
      <button className={u.active ? 'btn-danger btn-sm' : 'btn-primary btn-sm'} onClick={toggle}>{u.active ? 'Deactivate account' : 'Activate account'}</button>
      <div><h3 className="mb-1 text-base">Bookings</h3>{bookings.length ? bookings.map((b) => <div key={b._id} className="border-b py-1">Room {b.room?.roomNumber} · {date(b.checkIn)} → {date(b.checkOut)} · <Badge value={b.status} /></div>) : <p className="text-slate-500">None</p>}</div>
      <div><h3 className="mb-1 text-base">Payments</h3>{payments.length ? payments.map((p) => <div key={p._id} className="border-b py-1">{month(p.billingMonth)} · {label(p.type)} · {money(p.amountPaid)} / {money(p.amountDue)} · <Badge value={p.status} /></div>) : <p className="text-slate-500">None</p>}</div>
      <div><h3 className="mb-1 text-base">Mess subscriptions</h3>{subscriptions.length ? subscriptions.map((s) => <div key={s._id} className="border-b py-1">{s.plan?.name} · {label(s.customerType)} · {date(s.startDate)} → {date(s.endDate)} · <Badge value={s.status} /></div>) : <p className="text-slate-500">None</p>}</div>
    </div>}</Load></Modal>
  );
}
export default function Residents() {
  usePageMeta('Residents'); const [q, setQ] = useState({ search: '', category: '', active: '', page: 1 }); const [sel, setSel] = useState(null);
  const qs = new URLSearchParams(Object.entries(q).filter(([, v]) => v !== '' && v !== 1)).toString();
  const state = useFetch('/admin/users' + (qs ? '?' + qs : '')); const d = state.data;
  return (
    <>
      <PageHeader title="Residents" sub="Students and non-student residents, plus mess-only customers." />
      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-3">
        <input className="input" placeholder="Search name, email or phone" aria-label="Search" value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value, page: 1 })} />
        <select className="input" aria-label="Category" value={q.category} onChange={(e) => setQ({ ...q, category: e.target.value, page: 1 })}><option value="">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <select className="input" aria-label="Status" value={q.active} onChange={(e) => setQ({ ...q, active: e.target.value, page: 1 })}><option value="">All accounts</option><option value="1">Active</option><option value="0">Deactivated</option></select>
      </div>
      <Load state={state} empty={d?.items.length === 0 && 'No residents found.'}>
        <Table head={['Name', 'Category', 'Phone', 'Email', 'Joined', 'Status', '']}>{d?.items.map((u) => (
          <tr key={u._id}><td className="td font-semibold">{u.name}</td><td className="td">{u.residentCategory}</td><td className="td">{u.phone}</td><td className="td">{u.email}</td><td className="td">{date(u.createdAt)}</td><td className="td"><Badge value={u.active ? 'active' : 'cancelled'} tone={u.active ? 'green' : 'red'} /></td><td className="td"><button className="btn-outline btn-sm" onClick={() => setSel(u._id)}>View</button></td></tr>))}</Table>
        <Pager data={d} onPage={(page) => setQ({ ...q, page })} />
      </Load>
      {sel && <Detail id={sel} onClose={() => setSel(null)} onChange={state.reload} />}
    </>
  );
}
