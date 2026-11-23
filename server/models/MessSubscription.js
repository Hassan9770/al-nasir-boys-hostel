import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerType: { type: String, enum: ['hostel_resident', 'external'], required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MessPlan', required: true },
  monthlyPrice: { type: Number, required: true },
  mealsPerDay: { type: Number, required: true, min: 1 },
  startDate: { type: Date, required: true },
  durationMonths: { type: Number, required: true, min: 1, max: 12 },
  endDate: { type: Date, required: true },
  arrangement: { type: String, enum: ['dine_in', 'takeaway'] },
  notes: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'active', 'expired', 'cancelled', 'rejected'], default: 'pending' },
  cancellationRequested: { type: Boolean, default: false },
  adminNote: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });
schema.index({ user: 1, status: 1 });
schema.index({ customerType: 1, status: 1 });
export default mongoose.model('MessSubscription', schema);
