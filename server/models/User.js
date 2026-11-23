import mongoose from 'mongoose';
export const CATEGORIES = ['Student', 'Job Holder / Employee', 'Labour Worker', 'Business Owner / Self-Employed', 'Other', 'Mess Customer Only'];
const str = { type: String, trim: true, maxlength: 150 };
const schema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  phone: { type: String, required: [true, 'Phone is required'], trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['resident', 'admin'], default: 'resident' },
  residentCategory: { type: String, enum: CATEGORIES, default: 'Student' },
  institution: str, course: str, company: str, designation: str, employer: str, purposeOfStay: str,
  emergencyName: str, emergencyPhone: str,
  active: { type: Boolean, default: true },
  resetTokenHash: { type: String, select: false },
  resetExpires: { type: Date, select: false }
}, { timestamps: true });
schema.index({ role: 1, active: 1 });
schema.index({ name: 'text', email: 'text', phone: 'text' });
schema.set('toJSON', { transform: (d, r) => { delete r.passwordHash; delete r.resetTokenHash; delete r.resetExpires; delete r.__v; return r; } });
export default mongoose.model('User', schema);
