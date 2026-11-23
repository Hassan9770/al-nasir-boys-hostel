import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { Load, PageHeader, usePageMeta } from '../components/ui.jsx';
import { img } from '../services/api.js';
const CATS = ['Exterior', 'Bedrooms', 'Washrooms', 'Study Areas', 'Dining & Mess', 'Common Areas', 'Other'];
export default function Gallery() {
  usePageMeta('Gallery', 'Photos of AL NASIR BOYS HOSTEL');
  const [cat, setCat] = useState(''); const state = useFetch('/public/gallery' + (cat ? `?category=${encodeURIComponent(cat)}` : ''));
  const [i, setI] = useState(-1); const items = state.data?.items || [];
  useEffect(() => {
    if (i < 0) return;
    const h = (e) => { if (e.key === 'Escape') setI(-1); if (e.key === 'ArrowRight') setI((x) => (x + 1) % items.length); if (e.key === 'ArrowLeft') setI((x) => (x - 1 + items.length) % items.length); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [i, items.length]);
  return (
    <div className="container-x py-10"><PageHeader title="Gallery" />
      <div className="mb-6 flex flex-wrap gap-2">{['', ...CATS].map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${cat === c ? 'bg-navy-800 text-white' : 'bg-navy-50 text-navy-800 hover:bg-navy-100'}`}>{c || 'All'}</button>)}</div>
      <Load state={state} empty={items.length === 0 && 'No photos here yet.'}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{items.map((g, k) => <button key={g._id} onClick={() => setI(k)} className="group overflow-hidden rounded-lg" aria-label={`Open ${g.title || 'photo'}`}><img src={img(g.url)} alt={g.title || g.category} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" /></button>)}</div>
      </Load>
      {i >= 0 && items[i] && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Image preview">
        <button className="absolute right-4 top-4 text-white" onClick={() => setI(-1)} aria-label="Close"><X className="h-8 w-8" /></button>
        <button className="absolute left-3 text-white" onClick={() => setI((i - 1 + items.length) % items.length)} aria-label="Previous"><ChevronLeft className="h-10 w-10" /></button>
        <figure className="max-h-full text-center"><img src={img(items[i].url)} alt={items[i].title || ''} className="max-h-[80vh] max-w-full rounded" />{items[i].title && <figcaption className="mt-2 text-white">{items[i].title}</figcaption>}</figure>
        <button className="absolute right-3 text-white" onClick={() => setI((i + 1) % items.length)} aria-label="Next"><ChevronRight className="h-10 w-10" /></button>
      </div>}
    </div>
  );
}
