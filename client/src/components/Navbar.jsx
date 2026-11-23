import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
const links = [['/', 'Home'], ['/about', 'About Us'], ['/rooms', 'Rooms'], ['/facilities', 'Facilities'], ['/mess', 'Mess & Meals'], ['/gallery', 'Gallery'], ['/contact', 'Contact Us']];
export default function Navbar() {
  const [open, setOpen] = useState(false); const { user, isAdmin, logout } = useAuth(); const nav = useNavigate();
  const cls = ({ isActive }) => `rounded px-2.5 py-1.5 text-sm font-semibold ${isActive ? 'text-gold-600' : 'text-navy-800 hover:text-gold-600'}`;
  const out = async () => { await logout(); setOpen(false); nav('/'); };
  const items = (
    <>
      {links.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'} className={cls} onClick={() => setOpen(false)}>{t}</NavLink>)}
      {user ? (
        <>
          <NavLink to="/portal" className={cls} onClick={() => setOpen(false)}>Resident Dashboard</NavLink>
          {isAdmin && <NavLink to="/admin" className={cls} onClick={() => setOpen(false)}>Admin Dashboard</NavLink>}
          <button className="btn-outline btn-sm" onClick={out}>Logout</button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={cls} onClick={() => setOpen(false)}>Login</NavLink>
          <Link to="/register" className="btn-gold btn-sm" onClick={() => setOpen(false)}>Sign Up</Link>
        </>
      )}
    </>
  );
  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" aria-label="AL NASIR BOYS HOSTEL home"><Logo /></Link>
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">{items}</nav>
        <button className="rounded p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="flex flex-col items-start gap-1 border-t bg-white px-4 py-3 lg:hidden" aria-label="Mobile">{items}</nav>}
    </header>
  );
}
