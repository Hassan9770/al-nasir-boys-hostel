import { useParams, Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import Logo from '../../components/Logo.jsx';
import { Load, usePageMeta } from '../../components/ui.jsx';
import { money, month, date, label } from '../../utils/format.js';
export default function Receipt({ back = '/portal/payments' }) {
  usePageMeta('Receipt'); const { id } = useParams(); const state = useFetch(`/payments/${id}`); const { settings: s } = useSettings(); const p = state.data?.payment;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="no-print mb-4 flex justify-between"><Link to={back} className="font-semibold underline">← Back</Link><button className="btn-primary btn-sm" onClick={() => window.print()}><Printer className="h-4 w-4" />Print / Save as PDF</button></div>
      <Load state={state}>{p && (
        <div className="card bg-white p-8">
          <div className="flex items-start justify-between border-b pb-4"><Logo /><div className="text-right text-sm text-slate-600"><div className="font-bold text-navy-800">PAYMENT RECEIPT</div>{s?.phone}<br />{s?.address}</div></div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm"><dt className="text-slate-500">Resident</dt><dd className="font-semibold">{p.user.name}</dd><dt className="text-slate-500">Service</dt><dd>{label(p.type)}</dd><dt className="text-slate-500">Billing month</dt><dd>{month(p.billingMonth)}</dd><dt className="text-slate-500">Amount due</dt><dd>{money(p.amountDue)}</dd><dt className="text-slate-500">Total paid</dt><dd>{money(p.amountPaid)}</dd><dt className="text-slate-500">Balance</dt><dd className="font-semibold">{money(p.balance)}</dd></dl>
          <table className="mt-5 w-full text-sm"><thead className="border-b text-left text-slate-500"><tr><th className="py-1">Receipt no.</th><th>Date</th><th>Method</th><th>Reference</th><th className="text-right">Amount</th></tr></thead><tbody>{p.transactions.map((t) => <tr key={t._id} className="border-b"><td className="py-1.5 font-mono">{t.receiptNo}</td><td>{date(t.date)}</td><td>{t.method}</td><td>{t.reference || '—'}</td><td className="text-right">{money(t.amount)}</td></tr>)}</tbody></table>
          <p className="mt-6 text-xs text-slate-500">This receipt reflects payments recorded by hostel management. Generated {new Date().toLocaleDateString('en-GB')}.</p>
        </div>)}</Load>
    </div>
  );
}
