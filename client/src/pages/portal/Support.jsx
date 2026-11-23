import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { PageHeader, usePageMeta } from '../../components/ui.jsx';
import { waLink } from '../../utils/format.js';
export default function Support() {
  usePageMeta('Support'); const { settings: s } = useSettings(); if (!s) return null;
  return (
    <>
      <PageHeader title="Contact hostel management" />
      <div className="card max-w-xl space-y-3 p-5">
        {s.phone && <p className="flex gap-3"><Phone className="h-5 w-5 text-gold-500" />{s.phone}</p>}
        {s.email && <p className="flex gap-3"><Mail className="h-5 w-5 text-gold-500" />{s.email}</p>}
        {s.officeHours && <p className="text-sm text-slate-600">Office hours: {s.officeHours}</p>}
        {s.whatsappNumber && <a className="btn bg-[#25D366] text-white hover:brightness-95" target="_blank" rel="noopener noreferrer" href={waLink(s.whatsappNumber, 'Hello, I am a resident of AL NASIR BOYS HOSTEL and need some help.')}><MessageCircle className="h-5 w-5" />Chat on WhatsApp</a>}
        <p className="pt-2 text-sm"><Link className="underline" to="/contact">Send a message</Link> · <Link className="underline" to="/rules">Hostel rules</Link> · <Link className="underline" to="/terms">Terms</Link></p>
      </div>
    </>
  );
}
