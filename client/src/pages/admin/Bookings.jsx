import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg } from '../../services/api.js';
import { Badge, Load, PageHeader, Pager, Table, usePageMeta } from '../../components/ui.jsx';
import { date, money } from '../../utils/format.js';
const NEXT = { pending: [['approved', 'Approve', 'btn-primary'], ['rejected', 'Reject', 'btn-danger']], approved: [['checked_in', 'Check in', 'btn-primary'], ['cancelled', 'Cancel', 'btn-outline']], checked_in: [['completed', 'Check out', 'btn-primary'], ['cancelled', 'Cancel', 'btn-outline']] };
export default function Bookings() {
  usePageMeta('Bookings'); const [f, setF] = useState({ status: '', cancellation: '', page: 1 });
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v !== '' && v !== 1)).toString();
  const state = useFetch('/admin/bookings' + (qs ? '?' + qs : '')); const d = state.data; const [busy, setBusy] = useState('');
  const act = async (b, status) => {
    const adminNote = ['rejected', 'cancelled'].includes(status) ? prompt('Optional note for the resident:') ?? undefined : undefined;
    if (['rejected', 'cancelled'].includes(status) && adminNote === undefined) return;
    setBusy(b._id); try { await api.patch(`/admin/bookings/${b._id}/status`, { status, adminNote }); toast.success(`Booking ${status.replace('_', ' ')}`); state.reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(''); }
  };
  return (
    <>
      <PageHeader title="Accommodation bookings" />
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-4">
        <select className="input max-w-xs" aria-label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value, page: 1 })}><option value="">All statuses</option>{['pending', 'approved', 'checked_in', 'rejected', 'cancelled', 'completed'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="h-4 w-4" checked={!!f.cancellation} onChange={(e) => setF({ ...f, cancellation: e.target.checked ? '1' : '', page: 1 })} />Cancellation requested</label>
      </div>
      <Load state={state} empty={d?.items.length === 0 && 'No bookings found.'}>
        <Table head={['Resident', 'Room', 'Check-in / stay', 'Requirements', 'Status', 'Actions']}>{d?.items.map((b) => (
          <tr key={b._id}><td className="td"><b>{b.user?.name}</b><br /><span className="text-xs text-slate-500">{b.residentCategory} · {b.user?.phone}<br />Emergency: {b.user?.emergencyName} {b.user?.emergencyPhone}</span></td>
            <td className="td">{b.room?.roomNumber} ({b.room?.type})<br /><span className="text-xs">{money(b.room?.monthlyRent)}</span></td><td className="td">{date(b.checkIn)}<br /><span className="text-xs">{b.durationMonths} mo → {date(b.checkOut)}</span></td><td className="td max-w-[200px] text-xs">{b.requirements || '—'}</td>
            <td className="td"><Badge value={b.status} />{b.cancellationRequested && <div className="mt-1 text-xs font-semibold text-amber-700">Cancellation requested</div>}{b.adminNote && <div className="mt-1 text-xs text-slate-500">{b.adminNote}</div>}</td>
            <td className="td"><div className="flex flex-wrap gap-1">{(NEXT[b.status] || []).map(([s, l, c]) => <button key={s} className={`${c} btn-sm`} disabled={busy === b._id} onClick={() => act(b, s)}>{l}</button>)}</div></td></tr>))}</Table>
        <Pager data={d} onPage={(page) => setF({ ...f, page })} />
      </Load>
    </>
  );
}
