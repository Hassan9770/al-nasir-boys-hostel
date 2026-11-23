import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/ui.jsx';
import { Link as RLink } from 'react-router-dom';
export default function DashboardLayout({ title, links, whatsapp }) {
  const [open, setOpen] = useState(false); const { user, logout, pending, accept } = useAuth(); const nav = useNavigate();
  const cls = ({ isActive }) => `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-gold-500 text-navy-900' : 'text-navy-100 hover:bg-navy-700'}`;
  const side = (
    <div className="flex h-full flex-col">
      <Link to="/" className="mb-6 block px-2"><Logo light /></Link>
      <p className="mb-2 px-3 text-xs text-navy-200">{title}</p>
      <nav className="flex-1 space-y-1 overflow-y-auto" aria-label={title}>
        {links.map(([to, t, Icon, end]) => <NavLink key={to} to={to} end={end} className={cls} onClick={() => setOpen(false)}><Icon className="h-4 w-4" />{t}</NavLink>)}
      </nav>
      <div className="mt-4 space-y-1 border-t border-navy-700 pt-3">
        <Link to="/" className={cls({ isActive: false })}><Home className="h-4 w-4" />Public website</Link>
        <button className={cls({ isActive: false }) + ' w-full'} onClick={async () => { await logout(); nav('/'); }}><LogOut className="h-4 w-4" />Logout</button>
        <p className="truncate px-3 pt-2 text-xs text-navy-200">{user?.name}</p>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="no-print hidden w-60 shrink-0 bg-navy-900 p-4 lg:block"><div className="sticky top-4 h-[calc(100vh-2rem)]">{side}</div></aside>
      <div className="no-print flex items-center justify-between bg-navy-900 px-4 py-3 lg:hidden"><Logo light /><button onClick={() => setOpen(true)} aria-label="Open menu" className="text-white"><Menu /></button></div>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} /><div className="relative h-full w-64 bg-navy-900 p-4"><button className="absolute right-2 top-2 text-white" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>{side}</div></div>}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      {whatsapp && <WhatsAppButton />}
      {pending.length > 0 && (
        <Modal title="Updated policies" onClose={() => {}}>
          <p className="mb-3 text-sm">We have published updated policies. Please review and accept them to continue:</p>
          <ul className="mb-4 list-disc pl-5 text-sm">{pending.map((p) => <li key={p.type}><RLink className="font-semibold text-navy-700 underline" target="_blank" to={p.type === 'rules' ? '/rules' : p.type === 'privacy' ? '/privacy' : '/terms'}>{p.title}</RLink> (version {p.version})</li>)}</ul>
          <button className="btn-primary" onClick={accept}>I have read and agree</button>
        </Modal>
      )}
    </div>
  );
}
