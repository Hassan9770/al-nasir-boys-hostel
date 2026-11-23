import mongoose from 'mongoose';
export const POLICY_TYPES = ['terms', 'rules', 'mess', 'payment', 'privacy'];
const schema = new mongoose.Schema({
  type: { type: String, enum: POLICY_TYPES, required: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  content: { type: String, required: true, maxlength: 60000 },
  version: { type: Number, required: true, min: 1 },
  published: { type: Boolean, default: false },
  publishedAt: Date,
  requiresReacceptance: { type: Boolean, default: false }
}, { timestamps: true });
schema.index({ type: 1, version: -1 }, { unique: true });
export default mongoose.model('HostelPolicy', schema);
