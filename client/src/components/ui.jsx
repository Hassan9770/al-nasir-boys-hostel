import { useEffect } from 'react';
import { Loader2, Inbox, AlertCircle, X } from 'lucide-react';
import { label } from '../utils/format.js';

export function usePageMeta(title, desc) {
  useEffect(() => {
    document.title = title ? `${title} | AL NASIR BOYS HOSTEL` : 'AL NASIR BOYS HOSTEL';
    if (desc) document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  }, [title, desc]);
}
export const Spinner = ({ className = '' }) => <div className={`flex justify-center py-12 ${className}`} role="status" aria-label="Loading"><Loader2 className="h-8 w-8 animate-spin text-navy-600" /></div>;
export const ErrorBox = ({ message, onRetry }) => (
  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div className="flex-1">{message}</div>
    {onRetry && <button onClick={onRetry} className="font-semibold underline">Try again</button>}
  </div>
);
export const Empty = ({ text = 'Nothing here yet.' }) => <div className="flex flex-col items-center gap-2 py-12 text-slate-500"><Inbox className="h-8 w-8" /><p>{text}</p></div>;
export function Load({ state, children, empty }) {
  if (state.loading) return <Spinner />;
  if (state.error) return <ErrorBox message={state.error} onRetry={state.reload} />;
  if (empty) return <Empty text={empty} />;
  return children;
}
const TONES = { green: 'bg-green-100 text-green-800', red: 'bg-red-100 text-red-800', amber: 'bg-amber-100 text-amber-800', blue: 'bg-blue-100 text-blue-800', gray: 'bg-slate-100 text-slate-700' };
const MAP = { approved: 'green', active: 'green', paid: 'green', available: 'green', resolved: 'green', checked_in: 'blue', in_progress: 'blue', partial: 'amber', pending: 'amber', new: 'amber', unpaid: 'red', rejected: 'red', cancelled: 'gray', expired: 'gray', completed: 'gray', full: 'red', unavailable: 'gray' };
export const Badge = ({ value, tone }) => <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone || MAP[value] || 'gray']}`}>{label(value)}</span>;
export const PageHeader = ({ title, sub, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-slate-600">{sub}</p>}</div>{children}
  </div>
);
export function Field({ label: l, error, children, hint }) {
  return <div><label className="label">{l}</label>{children}{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}{error && <p className="mt-1 text-sm text-red-600" role="alert">{error.message || error}</p>}</div>;
}
export function Modal({ title, onClose, children, wide }) {
  useEffect(() => { const h = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-900/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`card my-8 w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} p-5`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl">{title}</h2><button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
        {children}
      </div>
    </div>
  );
}
export const Pager = ({ data, onPage }) => data && data.pages > 1 ? (
  <div className="mt-4 flex items-center justify-center gap-3">
    <button className="btn-outline btn-sm" disabled={data.page <= 1} onClick={() => onPage(data.page - 1)}>Previous</button>
    <span className="text-sm text-slate-600">Page {data.page} of {data.pages}</span>
    <button className="btn-outline btn-sm" disabled={data.page >= data.pages} onClick={() => onPage(data.page + 1)}>Next</button>
  </div>
) : null;
export const Table = ({ head, children }) => (
  <div className="card overflow-x-auto"><table className="w-full min-w-[640px]"><thead className="border-b bg-slate-50"><tr>{head.map((h) => <th key={h} className="th">{h}</th>)}</tr></thead><tbody className="divide-y">{children}</tbody></table></div>
);
export const Stat = ({ label: l, value, sub }) => <div className="card p-4"><div className="text-sm text-slate-500">{l}</div><div className="mt-1 text-2xl font-bold text-navy-800">{value}</div>{sub && <div className="text-xs text-slate-500">{sub}</div>}</div>;
