import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge, Load, PageHeader, Stat, usePageMeta } from '../../components/ui.jsx';
import { money, date, month, thisMonth } from '../../utils/format.js';
import { useSettings } from '../../context/SettingsContext.jsx';
export default function Overview() {
  usePageMeta('Resident Dashboard'); const { user } = useAuth(); const { settings: s } = useSettings();
  const b = useFetch('/bookings/mine'); const p = useFetch('/payments/mine'); const m = useFetch('/mess/subscriptions/mine');
  const current = b.data?.items.find((x) => ['approved', 'checked_in'].includes(x.status)) || b.data?.items.find((x) => x.status === 'pending');
  const latest = p.data?.items?.[0]; const sub = m.data?.items.find((x) => ['active', 'pending'].includes(x.status));
  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} sub={`${user.residentCategory} · ${user.email}`} />
      <Load state={{ loading: b.loading || p.loading || m.loading, error: b.error || p.error || m.error, reload: () => { b.reload(); p.reload(); m.reload(); } }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Booking status" value={current ? <Badge value={current.status} /> : 'No booking'} sub={current && `Room ${current.room?.roomNumber}`} />
          <Stat label="Monthly rent" value={current ? money(current.room?.monthlyRent) : '—'} />
          <Stat label="Latest payment" value={latest ? <Badge value={latest.status} /> : 'None recorded'} sub={latest && `${month(latest.billingMonth)} · ${money(latest.amountPaid)} of ${money(latest.amountDue)}`} />
          <Stat label="Outstanding balance" value={money(p.data?.outstanding)} />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card p-5"><h2 className="text-lg">Accommodation</h2>
            {current ? <dl className="mt-3 space-y-1 text-sm"><div>Room: <b>{current.room?.roomNumber}</b> ({current.room?.type})</div><div>Check-in: <b>{date(current.checkIn)}</b></div><div>Stay: <b>{current.durationMonths} month(s)</b>, until {date(current.checkOut)}</div>{current.cancellationRequested && <div className="text-amber-700">Cancellation requested — awaiting management.</div>}</dl>
              : <p className="mt-3 text-slate-600">You have no active room booking. <Link className="font-semibold underline" to="/rooms">Browse rooms</Link></p>}</section>
          <section className="card p-5"><h2 className="text-lg">Upcoming payment</h2>
            <p className="mt-3 text-sm text-slate-600">{s?.payment?.rentDueDay ? `Rent is due on day ${s.payment.rentDueDay} of each month.` : 'Due dates are set by management.'} Payments appear here only after management records them.</p>
            <Link to="/portal/payments" className="mt-3 inline-block font-semibold text-navy-700 underline">View payments</Link></section>
          <section className="card p-5"><h2 className="text-lg">Mess subscription</h2>
            {sub ? <p className="mt-3 text-sm"><b>{sub.plan?.name}</b> <Badge value={sub.status} /> · {date(sub.startDate)} to {date(sub.endDate)}</p> : <p className="mt-3 text-sm text-slate-600">No mess subscription. <Link className="font-semibold underline" to="/mess">View meal plans</Link></p>}</section>
          <section className="card p-5"><h2 className="text-lg">Need help?</h2><p className="mt-3 text-sm text-slate-600">Check the <Link className="underline" to="/rules">hostel rules</Link> or <Link className="underline" to="/portal/support">contact management</Link>.</p></section>
        </div>
      </Load>
    </>
  );
}
