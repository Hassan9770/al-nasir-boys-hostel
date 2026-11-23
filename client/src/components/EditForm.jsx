import { useForm } from 'react-hook-form';
import { Field } from './ui.jsx';
// fields: [{name,label,type:'text'|'number'|'textarea'|'select'|'checkbox'|'date'|'list'|'month', options, required, hint, span}]
export default function EditForm({ fields, initial = {}, onSubmit, submitLabel = 'Save changes', busy, children }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initial });
  const ser = (data) => {
    const out = { ...data };
    fields.forEach((f) => {
      if (f.type === 'list') out[f.name] = String(data[f.name] || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
      if (f.type === 'number' && out[f.name] !== '' && out[f.name] !== undefined) out[f.name] = Number(out[f.name]);
      if (out[f.name] === '' && !f.required && f.type !== 'text' && f.type !== 'textarea') delete out[f.name];
    });
    return out;
  };
  return (
    <form onSubmit={handleSubmit((d) => onSubmit(ser(d)))} className="grid gap-4 sm:grid-cols-2" noValidate>
      {fields.map((f) => (
        <div key={f.name} className={f.span === 2 || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
          {f.type === 'checkbox' ? (
            <label className="flex items-center gap-2 pt-6"><input type="checkbox" className="h-4 w-4" {...register(f.name)} /><span className="text-sm font-semibold">{f.label}</span></label>
          ) : (
            <Field label={f.label} error={errors[f.name]} hint={f.hint}>
              {f.type === 'textarea' ? <textarea rows={4} className="input" {...register(f.name, { required: f.required && `${f.label} is required` })} />
                : f.type === 'select' ? <select className="input" {...register(f.name, { required: f.required && `${f.label} is required` })}>{f.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select>
                : <input className="input" type={f.type === 'list' ? 'text' : f.type || 'text'} step={f.type === 'number' ? 'any' : undefined} {...register(f.name, { required: f.required && `${f.label} is required` })} />}
            </Field>
          )}
        </div>
      ))}
      {children}
      <div className="sm:col-span-2"><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button></div>
    </form>
  );
}
