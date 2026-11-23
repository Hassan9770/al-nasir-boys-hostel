import { z } from 'zod';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User, { CATEGORIES } from '../models/User.js';
import { AppError, wrap, addMonths, startOfDay, paginate, pageResult, optStr, objectId } from '../utils/helpers.js';
import { peakOccupancy } from '../services/availability.js';
import { recordAcceptance } from '../services/policy.js';
import { notifyWhatsApp } from '../services/notify.js';
import { withLock } from '../utils/lock.js';

export const bookingSchema = z.object({
  roomId: objectId,
  checkIn: z.coerce.date(),
  durationMonths: z.coerce.number().int().min(1, 'Minimum stay is 1 month').max(24),
  requirements: optStr(1000),
  residentCategory: z.enum(CATEGORIES.slice(0, 5)),
  institution: optStr(), course: optStr(), company: optStr(), designation: optStr(), employer: optStr(), purposeOfStay: optStr(),
  emergencyName: z.string().trim().min(2, 'Emergency contact name is required').max(100),
  emergencyPhone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, 'Enter a valid emergency phone'),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms & Conditions and Policies' }) })
});
export const statusSchema = z.object({ status: z.enum(['approved', 'rejected', 'checked_in', 'cancelled', 'completed']), adminNote: optStr(500) });

const TRANSITIONS = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['checked_in', 'cancelled'],
  checked_in: ['completed', 'cancelled']
};

export const createBooking = wrap(async (req, res) => {
  const b = req.body;
  const room = await Room.findById(b.roomId);
  if (!room || room.status !== 'active') throw new AppError('This room is not available for booking', 404);
  const checkIn = startOfDay(b.checkIn);
  if (checkIn < startOfDay()) throw new AppError('Check-in date cannot be in the past', 422);
  if (checkIn > addMonths(new Date(), 12)) throw new AppError('Check-in date is too far in the future', 422);
  const checkOut = addMonths(checkIn, b.durationMonths);
  const open = await Booking.findOne({ user: req.user._id, status: { $in: ['pending', 'approved', 'checked_in'] }, checkOut: { $gt: new Date() } });
  if (open) throw new AppError('You already have an open booking. Cancel it before requesting another room.', 409);
  const taken = await peakOccupancy(room._id, checkIn, checkOut);
  if (taken >= room.totalBeds) throw new AppError('No beds are available in this room for the selected dates', 409);

  const profile = {};
  ['residentCategory', 'institution', 'course', 'company', 'designation', 'employer', 'purposeOfStay', 'emergencyName', 'emergencyPhone'].forEach((k) => { if (b[k] !== undefined) profile[k] = b[k]; });
  Object.assign(req.user, profile); await req.user.save();
  const booking = await Booking.create({
    user: req.user._id, room: room._id, residentCategory: b.residentCategory, checkIn, durationMonths: b.durationMonths, checkOut,
    requirements: b.requirements, statusHistory: [{ status: 'pending', by: req.user._id }]
  });
  await recordAcceptance(req.user._id, 'booking', req);
  notifyWhatsApp(`New booking request: ${req.user.name} (${req.user.phone}) for room ${room.roomNumber}, check-in ${checkIn.toISOString().slice(0, 10)}.`);
  res.status(201).json({ success: true, booking });
});
export const myBookings = wrap(async (req, res) => {
  const items = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('room', 'roomNumber type monthlyRent images totalBeds');
  res.json({ success: true, items });
});
export const cancelMine = wrap(async (req, res) => {
  const bk = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!bk) throw new AppError('Booking not found', 404);
  if (bk.status === 'pending') { bk.status = 'cancelled'; bk.statusHistory.push({ status: 'cancelled', by: req.user._id }); }
  else if (['approved', 'checked_in'].includes(bk.status)) bk.cancellationRequested = true;
  else throw new AppError('This booking can no longer be cancelled', 409);
  await bk.save();
  res.json({ success: true, booking: bk });
});
export const adminList = wrap(async (req, res) => {
  const pg = paginate(req); const q = {};
  if (req.query.status) q.status = req.query.status;
  if (req.query.cancellation === '1') q.cancellationRequested = true;
  if (req.query.user) q.user = req.query.user;
  const [items, total] = await Promise.all([
    Booking.find(q).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('user', 'name email phone residentCategory emergencyName emergencyPhone').populate('room', 'roomNumber type monthlyRent totalBeds'),
    Booking.countDocuments(q)
  ]);
  res.json({ success: true, ...pageResult(items, total, pg) });
});
export const adminUpdateStatus = wrap(async (req, res) => {
  const { status, adminNote } = req.body;
  const bk = await Booking.findById(req.params.id);
  if (!bk) throw new AppError('Booking not found', 404);
  if (!(TRANSITIONS[bk.status] || []).includes(status)) throw new AppError(`Cannot change a ${bk.status} booking to ${status}`, 409);
  const apply = async () => {
    bk.status = status; if (adminNote !== undefined) bk.adminNote = adminNote;
    if (status === 'cancelled') bk.cancellationRequested = false;
    bk.statusHistory.push({ status, by: req.user._id });
    await bk.save();
  };
  if (status === 'approved') {
    await withLock(bk.room, async () => {
      const room = await Room.findById(bk.room);
      if (!room || room.status !== 'active') throw new AppError('Room is not active', 409);
      if ((await peakOccupancy(room._id, bk.checkIn, bk.checkOut, bk._id)) >= room.totalBeds) throw new AppError('Approving would exceed the room capacity for these dates', 409);
      await apply();
      // Safety net for multi-instance deployments: re-verify after write and roll back on overbooking.
      if ((await peakOccupancy(room._id, bk.checkIn, bk.checkOut)) > room.totalBeds) {
        bk.status = 'pending'; bk.statusHistory.pop(); await bk.save();
        throw new AppError('Capacity changed while approving. Please retry.', 409);
      }
    });
  } else await apply();
  res.json({ success: true, booking: bk });
});
export { User };
