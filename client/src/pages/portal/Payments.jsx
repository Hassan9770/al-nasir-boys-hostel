import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import { Badge, Load, PageHeader, Stat, Table, usePageMeta } from '../../components/ui.jsx';
import { money, month, label } from '../../utils/format.js';
export default function Payments() {
  usePageMeta('Rent & Payments'); const state = useFetch('/payments/mine'); const items = state.data?.items || [];
  return (
    <>
      <PageHeader title="Rent & payments" sub="Only payments recorded by hostel management are shown here." />
      <Load state={state} empty={items.length === 0 && 'No billing or payment records yet.'}>
        <div className="mb-5 grid gap-4 sm:grid-cols-3"><Stat label="Outstanding balance" value={money(state.data?.outstanding)} /><Stat label="Months paid" value={items.filter((i) => i.status === 'paid').length} /><Stat label="Months unpaid / partial" value={items.filter((i) => i.status !== 'paid').length} /></div>
        <Table head={['Month', 'Type', 'Due', 'Paid', 'Balance', 'Status', 'Last payment', '']}>{items.map((p) => { const last = p.transactions[p.transactions.length - 1]; return (
          <tr key={p._id}><td className="td font-semibold">{month(p.billingMonth)}</td><td className="td">{label(p.type)}</td><td className="td">{money(p.amountDue)}</td><td className="td">{money(p.amountPaid)}</td><td className="td">{money(p.balance)}</td><td className="td"><Badge value={p.status} /></td>
            <td className="td">{last ? `${new Date(last.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })} · ${last.method}` : '—'}</td><td className="td">{p.transactions.length > 0 && <Link className="font-semibold text-navy-700 underline" to={`/portal/receipt/${p._id}`}>Receipt</Link>}</td></tr>); })}</Table>
      </Load>
    </>
  );
}
