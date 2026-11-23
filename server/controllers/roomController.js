import { z } from 'zod';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { AppError, wrap } from '../utils/helpers.js';
import { withAvailability } from '../services/availability.js';

export const roomSchema = z.object({
  roomNumber: z.string().trim().min(1).max(40),
  type: z.enum(['Single', 'Double', 'Triple', 'Shared']),
  monthlyRent: z.coerce.number().min(0),
  totalBeds: z.coerce.number().int().min(1).max(30),
  facilities: z.array(z.string().trim().max(60)).max(30).default([]),
  images: z.array(z.string().max(300)).max(12).default([]),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(['active', 'inactive']).default('active')
});
export const listRooms = wrap(async (req, res) => {
  const { type, minRent, maxRent, available } = req.query;
  const q = {};
  if (!req.user || req.user.role !== 'admin' || req.query.all !== '1') q.status = 'active';
  if (['Single', 'Double', 'Triple', 'Shared'].includes(type)) q.type = type;
  if (minRent || maxRent) q.monthlyRent = { ...(minRent ? { $gte: +minRent } : {}), ...(maxRent ? { $lte: +maxRent } : {}) };
  let rooms = await withAvailability(await Room.find(q).sort({ roomNumber: 1 }));
  if (available === '1') rooms = rooms.filter((r) => r.availableBeds > 0);
  if (req.query.limit) rooms = rooms.slice(0, Math.min(50, +req.query.limit || 50));
  res.json({ success: true, items: rooms });
});
export const getRoom = wrap(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room || room.status !== 'active') throw new AppError('Room not found', 404);
  res.json({ success: true, room: (await withAvailability([room]))[0] });
});
export const createRoom = wrap(async (req, res) => res.status(201).json({ success: true, room: await Room.create(req.body) }));
export const updateRoom = wrap(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new AppError('Room not found', 404);
  if (req.body.totalBeds < room.totalBeds) {
    const now = new Date();
    const n = await Booking.countDocuments({ room: room._id, status: { $in: ['approved', 'checked_in'] }, checkOut: { $gt: now } });
    if (n > req.body.totalBeds) throw new AppError(`Cannot reduce beds below the ${n} active/approved bookings for this room`, 409);
  }
  Object.assign(room, req.body); await room.save();
  res.json({ success: true, room });
});
export const deleteRoom = wrap(async (req, res) => {
  if (await Booking.exists({ room: req.params.id })) throw new AppError('This room has booking records and cannot be deleted. Set it to inactive instead.', 409);
  await Room.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
