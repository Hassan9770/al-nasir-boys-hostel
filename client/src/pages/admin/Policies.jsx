import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg } from '../../services/api.js';
import EditForm from '../../components/EditForm.jsx';
import { Badge, Load, Modal, PageHeader, usePageMeta } from '../../components/ui.jsx';
import { Md } from '../Policy.jsx';
import { date } from '../../utils/format.js';
const NAMES = { terms: 'Terms & Conditions (accommodation)', rules: 'Hostel Rules & Conduct', mess: 'Mess Service Terms', payment: 'Payment, Cancellation & Refund', privacy: 'Privacy Policy' };
export default function Policies() {
  usePageMeta('Policies'); const state = useFetch('/admin/policies'); const [edit, setEdit] = useState(null); const [view, setView] = useState(null); const [busy, setBusy] = useState(false);
  const items = state.data?.items || [];
  const save = async (v) => { setBusy(true); try { const body = { ...v, type: edit.type }; if (edit._id) await api.put(`/admin/policies/${edit._id}`, body); else await api.post('/admin/policies', body); toast.success(v.publish ? 'Policy published' : 'Draft saved'); setEdit(null); state.reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  const del = async (p) => { if (!confirm('Delete this draft?')) return; try { await api.delete(`/admin/policies/${p._id}`); state.reload(); } catch (e) { toast.error(errMsg(e)); } };
  const fields = [{ name: 'title', label: 'Title', required: true, span: 2 }, { name: 'content', label: 'Content (use "## Heading" and "- bullet")', type: 'textarea', required: true }, { name: 'requiresReacceptance', label: 'Require all residents to re-accept this version', type: 'checkbox' }, { name: 'publish', label: 'Publish immediately', type: 'checkbox' }];
  return (
    <>
      <PageHeader title="Terms, rules & policies" sub="Published versions are locked for audit. Edit by creating a new version." />
      <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">The seeded text is a template for the hostel owner to review. It is not legal advice — have it checked before relying on it.</p>
      <Load state={state}>{Object.entries(NAMES).map(([type, name]) => { const list = items.filter((p) => p.type === type); const latest = list[0]; return (
        <section key={type} className="card mb-4 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg">{name}</h2><button className="btn-primary btn-sm" onClick={() => setEdit({ type, title: latest?.title || name, content: latest?.content || '', requiresReacceptance: false, publish: false })}>New version</button></div>
          {list.length === 0 ? <p className="mt-2 text-sm text-slate-500">Nothing yet.</p> : <ul className="mt-3 divide-y text-sm">{list.map((p) => <li key={p._id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span>Version {p.version} <Badge value={p.published ? 'active' : 'pending'} tone={p.published ? 'green' : 'amber'} /> <span className="text-slate-500">{p.published ? `published ${date(p.publishedAt)}` : 'draft'}{p.requiresReacceptance && ' · re-acceptance required'}</span></span>
            <span className="flex gap-2"><button className="btn-outline btn-sm" onClick={() => setView(p)}>View</button>{!p.published && <><button className="btn-outline btn-sm" onClick={() => setEdit(p)}>Edit draft</button><button className="btn btn-sm text-red-700" onClick={() => del(p)}>Delete</button></>}</span></li>)}</ul>}</section>); })}</Load>
      {edit && <Modal title={`${NAMES[edit.type]} — ${edit._id ? 'edit draft' : 'new version'}`} onClose={() => setEdit(null)} wide><EditForm fields={fields} initial={edit} onSubmit={save} busy={busy} submitLabel="Save" /></Modal>}
      {view && <Modal title={`${view.title} (v${view.version})`} onClose={() => setView(null)} wide><Md text={view.content} /></Modal>}
    </>
  );
}
