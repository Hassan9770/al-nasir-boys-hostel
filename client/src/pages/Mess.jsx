import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Clock, UtensilsCrossed, MessageCircle } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import api, { errMsg, img } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { Field, Load, Modal, PageHeader, usePageMeta } from '../components/ui.jsx';
import TermsCheckbox from '../components/TermsCheckbox.jsx';
import { money, today, label, waLink } from '../utils/format.js';

function SubscribeForm({ plan, onDone }) {
  const [busy, setBusy] = useState(false); const nav = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { customerType: 'external', mealsPerDay: plan.mealsPerDay, durationMonths: 1, arrangement: plan.diningOption === 'both' ? 'dine_in' : plan.diningOption } });
  const submit = async (v) => {
    setBusy(true);
    try { await api.post('/mess/subscriptions', { ...v, planId: plan._id, acceptTerms: true }); toast.success('Subscription request sent. Management will confirm it.'); onDone(); nav('/portal/mess'); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Customer category"><select className="input" {...register('customerType')}><option value="hostel_resident">Hostel Resident</option><option value="external">External Customer (live outside)</option></select></Field>
      <Field label="Start date" error={errors.startDate}><input type="date" min={today()} className="input" {...register('startDate', { required: 'Choose a start date', validate: (v) => v >= today() || 'Cannot be in the past' })} /></Field>
      <Field label="Duration (months)" error={errors.durationMonths}><input type="number" min="1" max="12" className="input" {...register('durationMonths', { required: 'Required', min: 1, max: 12 })} /></Field>
      <Field label="Meals per day" error={errors.mealsPerDay}><input type="number" min="1" max={plan.mealsPerDay} className="input" {...register('mealsPerDay', { required: 'Required', min: 1, max: { value: plan.mealsPerDay, message: `Max ${plan.mealsPerDay} on this plan` } })} /></Field>
      {plan.diningOption === 'both' && <Field label="Dining arrangement"><select className="input" {...register('arrangement')}><option value="dine_in">Dine at hostel</option><option value="takeaway">Collect / takeaway</option></select></Field>}
      <div className="sm:col-span-2"><Field label="Special requirements or dietary notes (optional)"><textarea rows={3} className="input" {...register('notes')} /></Field></div>
      <div className="sm:col-span-2"><TermsCheckbox register={register} error={errors.acceptTerms} mess /></div>
      <div className="sm:col-span-2"><button className="btn-gold" disabled={busy}>{busy ? 'Sending…' : `Subscribe — ${money(plan.monthlyPrice)}/month`}</button></div>
    </form>
  );
}
export default function Mess() {
  usePageMeta('Mess & Meal Services', 'Monthly mess subscription for hostel residents and people living outside.');
  const { settings: s } = useSettings(); const { user } = useAuth(); const state = useFetch('/mess/plans'); const [sel, setSel] = useState(null);
  const items = state.data?.items || [];
  return (
    <div className="container-x py-10">
      <PageHeader title="Mess & meal services" sub={s?.messIntro} />
      <div className="mb-6 flex flex-wrap gap-3 text-sm"><Link to="/terms" className="underline">Mess terms &amp; cancellation policy</Link>{s?.whatsappNumber && <a className="inline-flex items-center gap-1 font-semibold text-green-700 underline" target="_blank" rel="noopener noreferrer" href={waLink(s.whatsappNumber, 'Hello, I would like to enquire about the mess service at AL NASIR BOYS HOSTEL.')}><MessageCircle className="h-4 w-4" />WhatsApp enquiry</a>}</div>
      <p className="mb-6 rounded-lg bg-navy-50 p-3 text-sm text-navy-800">Open to hostel residents and to people living outside the hostel. A mess subscription does not book a room. You will need a free account (choose “Mess Customer Only” when signing up if you live outside).</p>
      <Load state={state} empty={items.length === 0 && 'Meal plans will be published soon.'}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((p) => (
          <article key={p._id} className="card flex flex-col overflow-hidden">
            {p.menuImage && <img src={img(p.menuImage)} alt={`${p.name} menu`} loading="lazy" className="h-40 w-full object-cover" />}
            <div className="flex flex-1 flex-col p-5">
              <h2 className="flex items-center gap-2 text-xl"><UtensilsCrossed className="h-5 w-5 text-gold-500" />{p.name}</h2>
              <p className="mt-1 text-2xl font-bold text-navy-800">{money(p.monthlyPrice)}<span className="text-sm font-normal text-slate-500"> / month</span></p>
              <p className="text-sm text-slate-600">{p.mealsPerDay} meal{p.mealsPerDay > 1 ? 's' : ''} per day{p.includedMeals ? ` · ${p.includedMeals}` : ''}</p>
              {p.description && <p className="mt-2 text-sm">{p.description}</p>}
              {p.timings && <p className="mt-2 flex gap-1.5 text-sm"><Clock className="mt-0.5 h-4 w-4 shrink-0" />{p.timings}</p>}
              {p.menu && <p className="mt-2 whitespace-pre-line text-sm text-slate-600"><b>Menu:</b> {p.menu}</p>}
              <p className="mt-2 text-sm text-slate-600"><b>Service:</b> {p.diningOption === 'both' ? 'Dine at hostel or collect' : label(p.diningOption)}</p>
              <div className="mt-auto pt-4">{user ? <button className="btn-primary w-full" onClick={() => setSel(p)}>Subscribe to Mess</button> : <Link to="/login" state={{ from: '/mess' }} className="btn-primary w-full">Log in to subscribe</Link>}</div>
            </div>
          </article>))}</div>
      </Load>
      {sel && <Modal title={`Subscribe: ${sel.name}`} onClose={() => setSel(null)} wide><SubscribeForm plan={sel} onDone={() => setSel(null)} /></Modal>}
    </div>
  );
}
