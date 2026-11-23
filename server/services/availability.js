import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
export const ACTIVE = ['approved', 'checked_in'];

// Peak number of simultaneous occupants within [from, to) given a set of bookings.
export function peak(bookings, from, to) {
  const points = [from, ...bookings.map((b) => b.checkIn).filter((d) => d > from && d < to)];
  let max = 0;
  for (const t of points) max = Math.max(max, bookings.filter((b) => b.checkIn <= t && b.checkOut > t).length);
  return max;
}
export async function peakOccupancy(roomId, from, to, excludeId) {
  const q = { room: roomId, status: { $in: ACTIVE }, checkIn: { $lt: to }, checkOut: { $gt: from } };
  if (excludeId) q._id = { $ne: excludeId };
  const bookings = await Booking.find(q).select('checkIn checkOut').lean();
  return peak(bookings, from, to);
}
export async function withAvailability(rooms) {
  const now = new Date();
  const ids = rooms.map((r) => r._id);
  const counts = await Booking.aggregate([
    { $match: { room: { $in: ids.map((i) => new mongoose.Types.ObjectId(i)) }, status: { $in: ACTIVE }, checkIn: { $lte: now }, checkOut: { $gt: now } } },
    { $group: { _id: '$room', n: { $sum: 1 } } }
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  return rooms.map((r) => {
    const o = r.toObject ? r.toObject() : r;
    const occupiedBeds = Math.min(o.totalBeds, map.get(String(o._id)) || 0);
    const availableBeds = o.totalBeds - occupiedBeds;
    return { ...o, occupiedBeds, availableBeds, availability: o.status !== 'active' ? 'unavailable' : availableBeds > 0 ? 'available' : 'full' };
  });
}
