import { ShieldCheck, Sparkles, Users, HeartHandshake, Home, Target, Eye } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { usePageMeta } from '../components/ui.jsx';
export default function About() {
  usePageMeta('About Us', 'About AL NASIR BOYS HOSTEL');
  const { settings: s } = useSettings(); if (!s) return null;
  const pts = [[Home, 'Comfortable accommodation', 'Furnished rooms for male students, job holders and working residents.'], [Sparkles, 'Cleanliness and discipline', 'Shared spaces are kept clean and house rules apply equally to everyone.'], [ShieldCheck, 'Safety and security', 'Residents are registered and verified before check-in.'], [HeartHandshake, 'Student-friendly environment', 'A calm, respectful place to study, work and rest.'], [Users, 'Open to all eligible residents', 'Students, employees, workers and business owners are all welcome.']];
  return (
    <div className="container-x py-12">
      <h1 className="text-4xl">About {s.hostelName}</h1><p className="mt-4 max-w-3xl text-lg text-slate-700">{s.description}</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card p-6"><Target className="mb-2 h-7 w-7 text-gold-500" /><h2 className="text-xl">Our mission</h2><p className="mt-2 text-slate-700">{s.mission}</p></div>
        <div className="card p-6"><Eye className="mb-2 h-7 w-7 text-gold-500" /><h2 className="text-xl">Our vision</h2><p className="mt-2 text-slate-700">{s.vision}</p></div>
      </div>
      <h2 className="mb-5 mt-14 text-2xl">What you can expect</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{pts.map(([I, t, d]) => <div key={t} className="card p-5"><I className="mb-2 h-7 w-7 text-gold-500" /><h3 className="text-lg">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div>
    </div>
  );
}
