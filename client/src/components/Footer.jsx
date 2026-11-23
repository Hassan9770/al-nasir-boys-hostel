import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import Logo from './Logo.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
export default function Footer() {
  const { settings: s } = useSettings();
  const soc = s?.social || {};
  return (
    <footer className="no-print mt-16 bg-navy-900 text-navy-100">
      <div className="container-x grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-1"><Logo light /><p className="mt-3 text-sm text-navy-200">{s?.tagline}</p>
          <div className="mt-4 flex gap-3">
            {soc.facebook && <a href={soc.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="h-5 w-5 hover:text-gold-400" /></a>}
            {soc.instagram && <a href={soc.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-gold-400" /></a>}
            {soc.youtube && <a href={soc.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube className="h-5 w-5 hover:text-gold-400" /></a>}
          </div></div>
        <div><h3 className="mb-3 font-sans text-base font-bold text-white">Quick links</h3>
          <ul className="space-y-1.5 text-sm">{[['/rooms', 'Rooms'], ['/facilities', 'Facilities'], ['/mess', 'Mess & Meals'], ['/gallery', 'Gallery'], ['/contact', 'Contact Us'], ['/register', 'Sign Up']].map(([to, t]) => <li key={to}><Link className="hover:text-gold-400" to={to}>{t}</Link></li>)}</ul></div>
        <div><h3 className="mb-3 font-sans text-base font-bold text-white">Policies</h3>
          <ul className="space-y-1.5 text-sm">{[['/terms', 'Terms & Conditions'], ['/rules', 'Hostel Rules & Policies'], ['/privacy', 'Privacy Policy']].map(([to, t]) => <li key={to}><Link className="hover:text-gold-400" to={to}>{t}</Link></li>)}</ul></div>
        <div><h3 className="mb-3 font-sans text-base font-bold text-white">Contact</h3>
          <ul className="space-y-2 text-sm">
            {s?.phone && <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0" />{s.phone}</li>}
            {s?.email && <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0" />{s.email}</li>}
            {s?.address && <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />{s.address}</li>}
            {s?.officeHours && <li className="flex gap-2"><Clock className="h-4 w-4 shrink-0" />{s.officeHours}</li>}
          </ul></div>
      </div>
      <div className="border-t border-navy-700 py-4 text-center text-xs text-navy-200">© {new Date().getFullYear()} AL NASIR BOYS HOSTEL. All rights reserved.</div>
    </footer>
  );
}
