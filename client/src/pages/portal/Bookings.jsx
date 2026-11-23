import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg } from '../../services/api.js';
import { Badge, Load, PageHeader, Table, usePageMeta } from '../../components/ui.jsx';
import { date, money } from '../../utils/format.js';
export default function Bookings() {
  usePageMeta('My Bookings'); const state = useFetch('/bookings/mine'); const [busy, setBusy] = useState('');
  const cancel = async (b) => {
    if (!confirm(b.status === 'pending' ? 'Cancel this booking request?' : 'Send a cancellation request to management?')) return;
    setBusy(b._id); try { await api.post(`/bookings/${b._id}/cancel`); toast.success(b.status === 'pending' ? 'Booking cancelled' : 'Cancellation requested'); state.reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(''); }
  };
  const items = state.data?.items || [];
  return (
    <>
      <PageHeader title="My bookings" sub="Track your accommodation requests and history."><Link to="/rooms" className="btn-gold">Book a room</Link></PageHeader>
      <Load state={state} empty={items.length === 0 && 'No bookings yet.'}>
        <Table head={['Room', 'Rent', 'Check-in', 'Stay', 'Status', '']}>{items.map((b) => (
          <tr key={b._id}><td className="td font-semibold">{b.room?.roomNumber} <span className="font-normal text-slate-500">({b.room?.type})</span></td><td className="td">{money(b.room?.monthlyRent)}</td><td className="td">{date(b.checkIn)}</td><td className="td">{b.durationMonths} mo<br /><span className="text-xs text-slate-500">to {date(b.checkOut)}</span></td>
            <td className="td"><Badge value={b.status} />{b.cancellationRequested && <div className="mt-1 text-xs text-amber-700">Cancellation requested</div>}{b.adminNote && <div className="mt-1 text-xs text-slate-500">Note: {b.adminNote}</div>}</td>
            <td className="td">{['pending', 'approved', 'checked_in'].includes(b.status) && !b.cancellationRequested && <button className="btn-outline btn-sm" disabled={busy === b._id} onClick={() => cancel(b)}>{b.status === 'pending' ? 'Cancel' : 'Request cancellation'}</button>}</td></tr>))}</Table>
      </Load>
    </>
  );
}
