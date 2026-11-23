import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  roomNumber: { type: String, required: [true, 'Room number is required'], unique: true, trim: true },
  type: { type: String, enum: ['Single', 'Double', 'Triple', 'Shared'], required: true },
  monthlyRent: { type: Number, required: true, min: [0, 'Rent cannot be negative'] },
  totalBeds: { type: Number, required: true, min: [1, 'At least one bed is required'], max: 30 },
  facilities: [{ type: String, trim: true }],
  images: [String],
  description: { type: String, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });
schema.index({ type: 1, monthlyRent: 1 });
export default mongoose.model('Room', schema);
