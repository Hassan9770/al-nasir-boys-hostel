import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  residentCategory: String,
  checkIn: { type: Date, required: true },
  durationMonths: { type: Number, required: true, min: 1, max: 24 },
  checkOut: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'checked_in', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  requirements: { type: String, trim: true, maxlength: 1000 },
  cancellationRequested: { type: Boolean, default: false },
  adminNote: { type: String, trim: true, maxlength: 500 },
  statusHistory: [{ status: String, at: { type: Date, default: Date.now }, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
}, { timestamps: true });
schema.index({ room: 1, status: 1, checkIn: 1, checkOut: 1 });
schema.index({ user: 1, createdAt: -1 });
export default mongoose.model('Booking', schema);
