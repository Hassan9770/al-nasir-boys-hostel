import { Field } from './ui.jsx';
export default function CategoryFields({ register, category, errors = {}, emergency }) {
  return (
    <>
      {category === 'Student' && <>
        <Field label="Institution or university name" error={errors.institution}><input className="input" {...register('institution')} /></Field>
        <Field label="Course or program (optional)"><input className="input" {...register('course')} /></Field></>}
      {category === 'Job Holder / Employee' && <>
        <Field label="Company or workplace name" error={errors.company}><input className="input" {...register('company')} /></Field>
        <Field label="Job designation (optional)"><input className="input" {...register('designation')} /></Field></>}
      {category === 'Labour Worker' && <Field label="Workplace or employer name (optional)"><input className="input" {...register('employer')} /></Field>}
      {category === 'Business Owner / Self-Employed' && <Field label="Business or work name (optional)"><input className="input" {...register('company')} /></Field>}
      {(category === 'Other') && <Field label="Purpose of stay" error={errors.purposeOfStay}><input className="input" {...register('purposeOfStay', { required: 'Please tell us the purpose of your stay' })} /></Field>}
      {emergency && <>
        <Field label="Emergency contact name" error={errors.emergencyName}><input className="input" autoComplete="off" {...register('emergencyName', { required: 'Emergency contact name is required' })} /></Field>
        <Field label="Emergency contact phone" error={errors.emergencyPhone}><input className="input" type="tel" autoComplete="off" {...register('emergencyPhone', { required: 'Emergency contact phone is required' })} /></Field></>}
    </>
  );
}
