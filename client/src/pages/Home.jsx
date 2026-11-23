import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ShieldCheck, Sparkles, Wallet, Users, Star, ChevronDown, Phone, MapPin, CheckCircle2, BedDouble, Wifi, BookOpen, Cctv, ShowerHead, Droplets, WashingMachine, Zap, UtensilsCrossed, CookingPot, Sofa, ParkingCircle, Shirt } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { useSettings } from '../context/SettingsContext.jsx';
import RoomCard from '../components/RoomCard.jsx';
import { Load, usePageMeta } from '../components/ui.jsx';
import { img } from '../services/api.js';
import { waLink } from '../utils/format.js';

const ICONS = { BedDouble, Wifi, BookOpen, ShieldCheck, Cctv, ShowerHead, Droplets, WashingMachine, Zap, UtensilsCrossed, CookingPot, Sofa, ParkingCircle, Shirt, CheckCircle2 };
export const FacIcon = ({ name, className = 'h-6 w-6' }) => { const I = ICONS[name] || CheckCircle2; return <I className={className} />; };
const WHY = [ShieldCheck, Sparkles, Wallet, Users];

export default function Home() {
  const { settings: s } = useSettings();
  usePageMeta('', s?.description?.slice(0, 150));
  const rooms = useFetch('/rooms?available=1&limit=3'); const tests = useFetch('/public/testimonials'); const gal = useFetch('/public/gallery');
  const [faq, setFaq] = useState(-1);
  if (!s) return null;
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        {s.heroImage && <img src={img(s.heroImage)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="container-x relative py-20 sm:py-28">
          <p className="mb-3 inline-block rounded-full border border-gold-500 px-3 py-1 text-sm text-gold-400">Students · Job holders · Working residents</p>
          <h1 className="max-w-3xl text-4xl !text-white sm:text-6xl">{s.tagline || 'Your Second Home Away From Home'}</h1>
          <p className="mt-5 max-w-2xl text-lg text-navy-100">{s.description}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/rooms" className="btn-gold">Explore Rooms</Link><Link to="/rooms" className="btn border border-white text-white hover:bg-white/10">Book Your Room</Link></div>
        </div>
      </section>

      {s.whyChooseUs?.length > 0 && <section className="container-x py-16"><h2 className="mb-8 text-center text-3xl">Why choose us</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{s.whyChooseUs.map((w, i) => { const I = WHY[i % 4]; return <div key={i} className="card p-5"><I className="mb-3 h-8 w-8 text-gold-500" /><h3 className="text-lg">{w.title}</h3><p className="mt-1 text-sm text-slate-600">{w.text}</p></div>; })}</div></section>}

      <section className="bg-slate-50 py-16"><div className="container-x">
        <div className="mb-8 flex items-end justify-between"><h2 className="text-3xl">Featured rooms</h2><Link to="/rooms" className="font-semibold text-navy-700 underline">See all rooms</Link></div>
        <Load state={rooms} empty={rooms.data?.items?.length === 0 && 'Rooms will appear here once added by management.'}><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rooms.data?.items.map((r) => <RoomCard key={r._id} room={r} />)}</div></Load>
      </div></section>

      {s.facilities?.length > 0 && <section className="container-x py-16"><div className="mb-8 flex items-end justify-between"><h2 className="text-3xl">Facilities &amp; amenities</h2><Link to="/facilities" className="font-semibold text-navy-700 underline">All facilities</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{s.facilities.slice(0, 6).map((f) => <div key={f.key} className="card flex gap-3 p-4"><span className="text-gold-500"><FacIcon name={f.icon} /></span><div><h3 className="text-base">{f.name}</h3><p className="text-sm text-slate-600">{f.description}</p></div></div>)}</div></section>}

      {tests.data?.items?.length > 0 && <section className="bg-navy-50 py-16"><div className="container-x"><h2 className="mb-8 text-center text-3xl">What residents say</h2>
        <div className="grid gap-5 md:grid-cols-3">{tests.data.items.slice(0, 3).map((t) => <figure key={t._id} className="card p-5"><div className="mb-2 flex">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold-500 text-gold-500" />)}</div><blockquote className="text-slate-700">“{t.message}”</blockquote><figcaption className="mt-3 text-sm font-semibold">{t.displayName}{t.role && <span className="font-normal text-slate-500"> — {t.role}</span>}</figcaption></figure>)}</div></div></section>}

      {gal.data?.items?.length > 0 && <section className="container-x py-16"><div className="mb-8 flex items-end justify-between"><h2 className="text-3xl">Gallery</h2><Link to="/gallery" className="font-semibold text-navy-700 underline">View gallery</Link></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{gal.data.items.slice(0, 4).map((g) => <img key={g._id} src={img(g.url)} alt={g.title || 'Hostel photo'} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />)}</div></section>}

      {s.faqs?.length > 0 && <section className="container-x max-w-3xl py-16"><h2 className="mb-6 text-center text-3xl">Frequently asked questions</h2>
        <div className="space-y-2">{s.faqs.map((f, i) => <div key={i} className="card"><button className="flex w-full items-center justify-between p-4 text-left font-semibold" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? -1 : i)}>{f.q}<ChevronDown className={`h-5 w-5 transition-transform ${faq === i ? 'rotate-180' : ''}`} /></button>{faq === i && <p className="px-4 pb-4 text-slate-600">{f.a}</p>}</div>)}</div></section>}

      <section className="bg-slate-50 py-16"><div className="container-x grid gap-8 md:grid-cols-2">
        <div><h2 className="text-3xl">Find us</h2><ul className="mt-4 space-y-3 text-slate-700">{s.address && <li className="flex gap-2"><MapPin className="h-5 w-5 shrink-0 text-gold-500" />{s.address}</li>}{s.phone && <li className="flex gap-2"><Phone className="h-5 w-5 shrink-0 text-gold-500" />{s.phone}</li>}</ul>
          <div className="mt-5 flex gap-3"><Link to="/contact" className="btn-primary">Contact us</Link>{s.whatsappNumber && <a className="btn-outline" target="_blank" rel="noopener noreferrer" href={waLink(s.whatsappNumber, s.whatsappMessage)}>WhatsApp</a>}</div></div>
        {s.mapEmbedUrl ? <iframe title="Hostel location" src={s.mapEmbedUrl} loading="lazy" className="h-64 w-full rounded-xl border-0" /> : <div className="flex h-64 items-center justify-center rounded-xl bg-navy-100 text-navy-600">Map location will be added by management</div>}
      </div></section>

      <section className="bg-navy-800 py-14 text-center text-white"><div className="container-x"><h2 className="text-3xl !text-white">Ready to move in?</h2><p className="mx-auto mt-2 max-w-xl text-navy-100">Create an account, pick your room and send a booking request in minutes.</p><Link to="/rooms" className="btn-gold mt-6">Book Your Room</Link></div></section>
    </>
  );
}
