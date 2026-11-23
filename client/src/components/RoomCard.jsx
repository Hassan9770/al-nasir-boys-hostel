import { Link } from 'react-router-dom';
import { BedDouble, Users } from 'lucide-react';
import { Badge } from './ui.jsx';
import { img } from '../services/api.js';
import { money } from '../utils/format.js';
export default function RoomCard({ room }) {
  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="relative h-44 bg-navy-100">
        {room.images?.[0] ? <img src={img(room.images[0])} alt={`Room ${room.roomNumber}`} loading="lazy" className="h-full w-full object-cover" />
          : <div className="flex h-full items-center justify-center text-navy-500"><BedDouble className="h-12 w-12" /></div>}
        <div className="absolute right-2 top-2"><Badge value={room.availability} /></div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between"><h3 className="text-lg">Room {room.roomNumber}</h3><span className="rounded bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-600">{room.type}</span></div>
        <p className="mt-1 text-xl font-bold text-navy-800">{money(room.monthlyRent)}<span className="text-sm font-normal text-slate-500"> / month</span></p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><Users className="h-4 w-4" />{room.availableBeds} of {room.totalBeds} beds available</p>
        {room.facilities?.length > 0 && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{room.facilities.join(' • ')}</p>}
        <Link to={`/rooms/${room._id}`} className="btn-primary mt-4 w-full">{room.availability === 'available' ? 'View & Book' : 'View details'}</Link>
      </div>
    </article>
  );
}
