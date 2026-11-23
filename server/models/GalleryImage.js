import mongoose from 'mongoose';
export const GALLERY_CATEGORIES = ['Exterior', 'Bedrooms', 'Washrooms', 'Study Areas', 'Dining & Mess', 'Common Areas', 'Other'];
const schema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, trim: true, maxlength: 100 },
  category: { type: String, enum: GALLERY_CATEGORIES, default: 'Other' },
  active: { type: Boolean, default: true }
}, { timestamps: true });
schema.index({ category: 1, active: 1 });
export default mongoose.model('GalleryImage', schema);
