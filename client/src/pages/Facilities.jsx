import { useSettings } from '../context/SettingsContext.jsx';
import { Empty, PageHeader, usePageMeta } from '../components/ui.jsx';
import { FacIcon } from './Home.jsx';
export default function Facilities() {
  usePageMeta('Facilities', 'Facilities and amenities at AL NASIR BOYS HOSTEL');
  const { settings: s } = useSettings(); if (!s) return null;
  return (
    <div className="container-x py-10"><PageHeader title="Hostel facilities" sub="Only facilities confirmed by management are listed." />
      {s.facilities?.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{s.facilities.map((f) => <div key={f.key} className="card p-6"><span className="mb-3 inline-flex rounded-lg bg-navy-800 p-3 text-gold-400"><FacIcon name={f.icon} /></span><h2 className="text-lg">{f.name}</h2><p className="mt-1 text-sm text-slate-600">{f.description}</p></div>)}</div> : <Empty text="Facilities will be listed here soon." />}
    </div>
  );
}
