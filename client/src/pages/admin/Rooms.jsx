import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg, img } from '../../services/api.js';
import EditForm from '../../components/EditForm.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';
import { Badge, Load, Modal, PageHeader, Table, usePageMeta } from '../../components/ui.jsx';
import { money } from '../../utils/format.js';
const FIELDS = [
  { name: 'roomNumber', label: 'Room number / name', required: true }, { name: 'type', label: 'Room type', type: 'select', options: ['Single', 'Double', 'Triple', 'Shared'] },
  { name: 'monthlyRent', label: 'Monthly rent (PKR)', type: 'number', required: true }, { name: 'totalBeds', label: 'Total beds', type: 'number', required: true },
  { name: 'facilities', label: 'Room facilities', type: 'list', hint: 'Comma separated', span: 2 }, { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active (bookable)' }, { value: 'inactive', label: 'Inactive (hidden)' }] }
];
export default function Rooms() {
  usePageMeta('Manage Rooms'); const state = useFetch('/admin/rooms'); const [edit, setEdit] = useState(null); const [images, setImages] = useState([]); const [busy, setBusy] = useState(false);
  const open = (r) => { setEdit(r || {}); setImages(r?.images || []); };
  const save = async (v) => {
    setBusy(true);
    try { const body = { ...v, images }; if (edit._id) await api.put(`/admin/rooms/${edit._id}`, body); else await api.post('/admin/rooms', body); toast.success('Room saved'); setEdit(null); state.reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const del = async (r) => { if (!confirm(`Delete room ${r.roomNumber}?`)) return; try { await api.delete(`/admin/rooms/${r._id}`); toast.success('Room deleted'); state.reload(); } catch (e) { toast.error(errMsg(e)); } };
  const items = state.data?.items || [];
  return (
    <>
      <PageHeader title="Rooms & beds"><button className="btn-primary" onClick={() => open()}>Add room</button></PageHeader>
      <Load state={state} empty={items.length === 0 && 'No rooms yet.'}>
        <Table head={['Room', 'Type', 'Rent', 'Beds', 'Occupied now', 'Available now', 'Status', '']}>{items.map((r) => (
          <tr key={r._id}><td className="td font-semibold">{r.roomNumber}</td><td className="td">{r.type}</td><td className="td">{money(r.monthlyRent)}</td><td className="td">{r.totalBeds}</td><td className="td">{r.occupiedBeds}</td><td className="td">{r.availableBeds}</td><td className="td"><Badge value={r.status === 'active' ? r.availability : 'unavailable'} /></td>
            <td className="td whitespace-nowrap"><button className="btn-outline btn-sm mr-2" onClick={() => open(r)}>Edit</button><button className="btn-sm btn text-red-700 hover:bg-red-50" onClick={() => del(r)}>Delete</button></td></tr>))}</Table>
      </Load>
      {edit && <Modal title={edit._id ? `Edit room ${edit.roomNumber}` : 'Add room'} onClose={() => setEdit(null)} wide>
        <EditForm fields={FIELDS} initial={{ type: 'Double', status: 'active', ...edit, facilities: (edit.facilities || []).join(', ') }} onSubmit={save} busy={busy}>
          <div className="sm:col-span-2"><span className="label">Photos</span><div className="flex flex-wrap items-center gap-2">{images.map((u) => <div key={u} className="relative"><img src={img(u)} alt="" className="h-16 w-24 rounded object-cover" /><button type="button" aria-label="Remove photo" className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white" onClick={() => setImages(images.filter((x) => x !== u))}>×</button></div>)}<ImageUpload label="Add photo" onUploaded={(u) => setImages([...images, u])} /></div></div>
        </EditForm></Modal>}
    </>
  );
}
