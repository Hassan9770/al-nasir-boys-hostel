import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch.js';
import { Load, usePageMeta } from '../components/ui.jsx';
import { date } from '../utils/format.js';
// Minimal safe markdown renderer (headings, bullets, bold, paragraphs). No raw HTML is ever injected.
function inline(t) { return t.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p)); }
export function Md({ text }) {
  const out = []; let list = [];
  const flush = () => { if (list.length) { out.push(<ul key={out.length}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>); list = []; } };
  text.split('\n').forEach((line) => {
    if (/^\s*[-*]\s+/.test(line)) list.push(line.replace(/^\s*[-*]\s+/, ''));
    else { flush(); if (/^##\s+/.test(line)) out.push(<h2 key={out.length}>{line.replace(/^##\s+/, '')}</h2>); else if (line.trim()) out.push(<p key={out.length}>{inline(line)}</p>); }
  });
  flush(); return <div className="prose-policy">{out}</div>;
}
const PAGES = { terms: ['Terms & Conditions', ['terms', 'payment', 'mess']], rules: ['Hostel Rules & Policies', ['rules']], privacy: ['Privacy Policy', ['privacy']] };
export default function Policy({ page }) {
  const [title, types] = PAGES[page]; usePageMeta(title); const state = useFetch('/public/policies');
  const ps = state.data?.policies || {};
  return (
    <div className="container-x max-w-3xl py-10"><h1 className="text-3xl">{title}</h1>
      <nav className="mt-3 flex gap-4 text-sm font-semibold text-navy-700">{Object.entries(PAGES).map(([k, [t]]) => <Link key={k} to={'/' + k} className={k === page ? 'underline' : ''}>{t}</Link>)}</nav>
      <Load state={state} empty={!types.some((t) => ps[t]) && 'This policy has not been published yet.'}>
        {types.map((t) => ps[t] && <section key={t} className="card mt-6 p-6"><h2 className="text-xl">{ps[t].title}</h2><p className="text-xs text-slate-500">Version {ps[t].version} · Published {date(ps[t].publishedAt)}</p><div className="mt-3"><Md text={ps[t].content} /></div></section>)}
      </Load>
    </div>
  );
}
