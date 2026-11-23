import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  displayName: { type: String, required: true, trim: true, maxlength: 80 },
  role: { type: String, trim: true, maxlength: 80 },
  message: { type: String, required: true, trim: true, maxlength: 600 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  approved: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Testimonial', schema);
