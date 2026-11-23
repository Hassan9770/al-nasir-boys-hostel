import { useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { Field, PageHeader, usePageMeta } from '../components/ui.jsx';
import { waLink } from '../utils/format.js';
export default function Contact() {
  usePageMeta('Contact Us', 'Contact AL NASIR BOYS HOSTEL');
  const { settings: s } = useSettings(); const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const submit = async (v) => { setBusy(true); try { const r = await api.post('/public/contact', v); toast.success(r.data.message); reset(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  if (!s) return null;
  return (
    <div className="container-x py-10"><PageHeader title="Contact us" sub="Send us a message or reach us directly." />
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit(submit)} className="card space-y-4 p-5" noValidate>
          <Field label="Name" error={errors.name}><input className="input" {...register('name', { required: 'Enter your name' })} /></Field>
          <Field label="Email (optional)" error={errors.email}><input type="email" className="input" {...register('email', { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} /></Field>
          <Field label="Phone number" error={errors.phone}><input type="tel" className="input" {...register('phone', { required: 'Enter your phone number', pattern: { value: /^[+\d][\d\s-]{6,18}$/, message: 'Enter a valid phone number' } })} /></Field>
          <Field label="Message" error={errors.message}><textarea rows={5} className="input" {...register('message', { required: 'Write a message', minLength: { value: 5, message: 'Message is too short' } })} /></Field>
          <button className="btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
        </form>
        <div className="space-y-4">
          <ul className="card space-y-3 p-5">
            {s.phone && <li className="flex gap-3"><Phone className="h-5 w-5 text-gold-500" />{s.phone}</li>}
            {s.email && <li className="flex gap-3"><Mail className="h-5 w-5 text-gold-500" />{s.email}</li>}
            {s.address && <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-gold-500" />{s.address}</li>}
            {s.officeHours && <li className="flex gap-3"><Clock className="h-5 w-5 text-gold-500" />{s.officeHours}</li>}
            {s.whatsappNumber && <li><a className="btn bg-[#25D366] text-white hover:brightness-95" target="_blank" rel="noopener noreferrer" href={waLink(s.whatsappNumber, s.whatsappMessage)}><MessageCircle className="h-5 w-5" />Chat on WhatsApp</a></li>}
          </ul>
          {s.mapEmbedUrl ? <iframe title="Hostel location" src={s.mapEmbedUrl} loading="lazy" className="h-64 w-full rounded-xl border-0" /> : <div className="flex h-48 items-center justify-center rounded-xl bg-navy-100 text-navy-600">Map location will be added by management</div>}
          {s.mapLink && <a href={s.mapLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-700 underline">Open in Google Maps</a>}
        </div>
      </div>
    </div>
  );
}
