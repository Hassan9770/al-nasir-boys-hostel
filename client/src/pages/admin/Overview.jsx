import useFetch from '../../hooks/useFetch.js';
import { Load, PageHeader, Stat, usePageMeta } from '../../components/ui.jsx';
import { money, month } from '../../utils/format.js';
export default function Overview() {
  usePageMeta('Admin Dashboard'); const state = useFetch('/admin/stats'); const s = state.data?.stats;
  const G = ({ title, children }) => <section className="mb-8"><h2 className="mb-3 text-lg">{title}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div></section>;
  return (
    <>
      <PageHeader title="Admin dashboard" sub="All figures are calculated from recorded data." />
      <Load state={state}>{s && <>
        <G title="Residents"><Stat label="Total residents" value={s.totalResidents} /><Stat label="Student residents" value={s.studentResidents} /><Stat label="Working residents" value={s.workingResidents} sub="Job holders, labour, business" /></G>
        <G title="Rooms & beds"><Stat label="Rooms" value={s.totalRooms} /><Stat label="Total beds" value={s.totalBeds} /><Stat label="Available beds" value={s.availableBeds} /><Stat label="Occupied beds" value={s.occupiedBeds} /></G>
        <G title="Bookings & mess"><Stat label="Pending accommodation bookings" value={s.pendingBookings} /><Stat label="Approved / checked-in" value={s.approvedBookings} /><Stat label="Active mess subscriptions" value={s.activeMess} /><Stat label="External mess customers" value={s.externalMess} sub={`${s.pendingMess} pending requests`} /></G>
        <G title={`Finance (${month(s.month)})`}><Stat label="Outstanding rent" value={money(s.outstandingRent)} /><Stat label="Outstanding mess" value={money(s.outstandingMess)} /><Stat label="Rent received this month" value={money(s.monthlyRentRevenue)} /><Stat label="Mess received this month" value={money(s.monthlyMessRevenue)} /></G>
      </>}</Load>
    </>
  );
}
