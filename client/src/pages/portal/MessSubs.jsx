import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg } from '../../services/api.js';
import { Badge, Load, PageHeader, Table, usePageMeta } from '../../components/ui.jsx';
import { date, money, label } from '../../utils/format.js';
export default function MessSubs() {
  usePageMeta('My Mess Subscriptions'); const state = useFetch('/mess/subscriptions/mine'); const items = state.data?.items || [];
  const cancel = async (s) => { if (!confirm('Cancel / request cancellation of this subscription?')) return; try { await api.post(`/mess/subscriptions/${s._id}/cancel`); toast.success('Done'); state.reload(); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <>
      <PageHeader title="My mess subscriptions" sub="Meal subscriptions are separate from room bookings."><Link to="/mess" className="btn-gold">View meal plans</Link></PageHeader>
      <Load state={state} empty={items.length === 0 && 'No mess subscriptions yet.'}>
        <Table head={['Plan', 'Category', 'Meals/day', 'Price', 'Period', 'Status', '']}>{items.map((s) => (
          <tr key={s._id}><td className="td font-semibold">{s.plan?.name}</td><td className="td">{label(s.customerType)}</td><td className="td">{s.mealsPerDay}</td><td className="td">{money(s.monthlyPrice)}/mo</td><td className="td">{date(s.startDate)} – {date(s.endDate)}</td><td className="td"><Badge value={s.status} />{s.cancellationRequested && <div className="mt-1 text-xs text-amber-700">Cancellation requested</div>}</td>
            <td className="td">{['pending', 'active'].includes(s.status) && !s.cancellationRequested && <button className="btn-outline btn-sm" onClick={() => cancel(s)}>Cancel</button>}</td></tr>))}</Table>
      </Load>
    </>
  );
}
