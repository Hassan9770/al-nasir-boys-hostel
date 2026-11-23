import { useState } from 'react';
import useFetch from '../hooks/useFetch.js';
import RoomCard from '../components/RoomCard.jsx';
import { Load, PageHeader, usePageMeta } from '../components/ui.jsx';
export default function Rooms() {
  usePageMeta('Rooms', 'Browse hostel rooms, monthly rent and live bed availability.');
  const [f, setF] = useState({ type: '', minRent: '', maxRent: '', available: false });
  const qs = new URLSearchParams(Object.entries({ type: f.type, minRent: f.minRent, maxRent: f.maxRent, available: f.available ? '1' : '' }).filter(([, v]) => v)).toString();
  const state = useFetch('/rooms' + (qs ? '?' + qs : ''));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <div className="container-x py-10">
      <PageHeader title="Rooms & accommodation" sub="Prices and availability are live from our records." />
      <div className="card mb-6 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><label className="label" htmlFor="t">Room type</label><select id="t" className="input" value={f.type} onChange={set('type')}><option value="">All types</option>{['Single', 'Double', 'Triple', 'Shared'].map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label className="label" htmlFor="mn">Min rent (PKR)</label><input id="mn" type="number" min="0" className="input" value={f.minRent} onChange={set('minRent')} /></div>
        <div><label className="label" htmlFor="mx">Max rent (PKR)</label><input id="mx" type="number" min="0" className="input" value={f.maxRent} onChange={set('maxRent')} /></div>
        <label className="flex items-center gap-2 pt-6"><input type="checkbox" className="h-4 w-4" checked={f.available} onChange={set('available')} /><span className="font-semibold">Available rooms only</span></label>
      </div>
      <Load state={state} empty={state.data?.items?.length === 0 && 'No rooms match these filters.'}><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{state.data?.items.map((r) => <RoomCard key={r._id} room={r} />)}</div></Load>
    </div>
  );
}
