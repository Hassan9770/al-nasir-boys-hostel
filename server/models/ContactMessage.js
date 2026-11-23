import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, maxlength: 150 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' },
  adminReply: { type: String, trim: true, maxlength: 2000 }
}, { timestamps: true });
schema.index({ status: 1, createdAt: -1 });
export default mongoose.model('ContactMessage', schema);
